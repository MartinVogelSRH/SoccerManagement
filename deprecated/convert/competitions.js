'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
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

const buildCompetition = (map, fantasy) => {
    const comp = map[fantasy.CompetitionId];
    if (!comp) {
        return null;
    }

    const _id = monk.id();
    const type = _.toLower(comp.Type);
    const format = comp.Format;
    const name = comp.Name;
    const season = fantasy.Name;
    const country = comp.AreaName;
    const teams = null;

    return { _id, type, format, name, season, country };
};

const reducer = map => (result, fantasy) => {
    const competition = buildCompetition(map, fantasy);
    if (!competition) {
        return result;
    }
    result.competitions.push(competition);

    const mapping = MappingService.build(
        'season',
        fantasy.SeasonId,
        competition._id
    );
    result.mappings.push(mapping);

    return result;
};

const tasks = {
    competitions: dumpDB
        .get('competitions')
        .find({})
        .then(docs => _.keyBy(docs, 'CompetitionId')),
    seasons: dumpDB.get('seasons').find({}),
    convert: [
        'competitions',
        'seasons',
        results => {
            const data = _.reduce(
                results.seasons,
                reducer(results.competitions),
                {
                    competitions: [],
                    mappings: [],
                }
            );
            if (_.isEmpty(data.competitions) || _.isEmpty(data.mappings)) {
                return null;
            }

            const competitions = footballDB
                .get('competitions')
                .insert(data.competitions);

            const mappings = dumpDB.get('mappings').insert(data.mappings);
            return Promise.all([competitions, mappings]);
        },
    ],
};

auto(tasks)
    .catch(console.error)
    .then(exit, exit);
