'use strict';

const _ = require('lodash');
const monk = require('monk');
const moment = require('moment');
const config = require('config');

const MappingService = require('./mappings');

const dumpDB = monk(config.get('databases.fantasy'));
const footballDB = monk(config.get('databases.football'));
const exit = () =>
    Promise.all([dumpDB.close(), footballDB.close()]).then(() =>
        process.exit()
    );

const buildDate = date => moment.utc(_.replace(date, /T.*$/, '')).toDate();

const buildPlayer = fantasy => {
    const _id = monk.id();
    const type = 'player';

    // NOTE: There was one player without a first name so just to be sure
    const firstName = fantasy.FirstName || _.split(fantasy.CommonName, ' ')[0];
    const lastName = fantasy.LastName;

    const birthday = buildDate(fantasy.BirthDate);
    const nationality = fantasy.Nationality;

    const agentId = null;

    return { _id, type, firstName, lastName, birthday, nationality };
};

const reducer = (result, fantasy) => {
    const player = buildPlayer(fantasy);
    result.players.push(player);

    const mapping = MappingService.build(
        'player',
        fantasy.PlayerId,
        player._id
    );
    result.mappings.push(mapping);

    return result;
};

dumpDB
    .get('players')
    .find({})
    .then(fantasy =>
        _.reduce(fantasy, reducer, {
            players: [],
            mappings: [],
        })
    )
    .then(data => {
        if (_.isEmpty(data.players) || _.isEmpty(data.mappings)) {
            return null;
        }
        const players = footballDB.get('people').insert(data.players);
        const mappings = MappingService.insert(data.mappings);
        return Promise.all([players, mappings]);
    })
    .then(console.log)
    .catch(console.error)
    .then(exit, exit);
