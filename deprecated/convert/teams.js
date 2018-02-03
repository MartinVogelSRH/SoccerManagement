'use strict';

const _ = require('lodash');
const monk = require('monk');
const config = require('config');

const MappingService = require('./mappings');

const dumpDB = monk(config.get('databases.fantasy'));
const footballDB = monk(config.get('databases.football'));
const exit = () =>
    Promise.all([dumpDB.close(), footballDB.close()]).then(() =>
        process.exit()
    );

const buildTeam = fantasy => {
    const _id = monk.id();

    // NOTE: Alternative would be FullName but this could be something like ПФК ЦСКА София
    const name = fantasy.Name;
    const type = _.toLower(fantasy.Type);

    const country = fantasy.AreaName;
    const city = fantasy.City;

    return { _id, name, type, country, city };
};

const reducer = (result, fantasyTeam) => {
    const team = buildTeam(fantasyTeam);
    result.teams.push(team);

    const mapping = MappingService.build('team', fantasyTeam.TeamId, team._id);
    result.mappings.push(mapping);

    return result;
};

dumpDB
    .get('teams')
    .find({})
    .then(fantasyTeams =>
        _.reduce(fantasyTeams, reducer, {
            teams: [],
            mappings: [],
        })
    )
    .then(data => {
        if (_.isEmpty(data.teams) || _.isEmpty(data.mappings)) {
            return null;
        }
        const teams = footballDB.get('teams').insert(data.teams);
        const mappings = MappingService.insert(data.mappings);
        return Promise.all([teams, mappings]);
    })
    .then(console.log)
    .catch(console.error)
    .then(exit, exit);
