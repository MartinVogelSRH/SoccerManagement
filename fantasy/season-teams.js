'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const config = require('config');

const FantasyData = require('./fantasy-data');

const subscriptionKeys = config.get('fantasy.subscriptionKeys');
const fantasyData = FantasyData({ subscriptionKeys });

const dbs = {
    fantasy: monk(config.get('databases.fantasy')),
    football: monk(config.get('databases.football')),
    close: () =>
        Promise.all([dbs.fantasy.close(), dbs.football.close()])
};

const collections = {
    mappings: dbs.fantasy.get('mappings'),
    seasonTeams: dbs.football.get('seasonTeams'),
    competitions: dbs.football.get('competitions'),
};

const getSeasonTeams = () => {
    const request = (competitionId, SeasonId) => Promise.all([competitionId, fantasyData.seasonTeams(SeasonId)]).catch(err => {
        console.error(`Error requesting teams for season ${SeasonId}`, err);
        return null;
    });

    return collections.mappings
        .find({ type: 'season' })
        .then(mappings => {
            const requests = _.map(mappings, ({ objectId, fantasyId }) => request(objectId, fantasyId));
            return Promise.all(requests)
                .then(_.compact)
                .then(_.fromPairs);
        })
        .then(results => collections.seasonTeams.insert(_.flatMap(results)).then(() => results));
};

const getTeamMappings = () =>
    collections.mappings.find({ type: 'team' }).then(mappings =>
        _.chain(mappings)
            .keyBy('fantasyId')
            .mapValues('objectId')
            .value()
    );

const tasks = {
    seasonTeamsMap: getSeasonTeams,
    teamMappings: getTeamMappings,
    update: [
        'seasonTeamsMap', 'teamMappings', ({ seasonTeamsMap, teamMappings }) => {
            const updates = _.map(seasonTeamsMap, (seasonTeams, competitionId) => {
                const teams = _.compact(_.map(seasonTeams, ({ TeamId }) => teamMappings[TeamId]));
                if (_.size(teams) !== _.size(seasonTeams)) {
                    console.log(`${competitionId}: Could not find a team in ${JSON.stringify(teams)}`);
                }

                return collections.competitions.findOneAndUpdate({ _id: competitionId }, { $set: { teams } });
            });

            return Promise.all(updates);
        }
    ]
};

auto(tasks).then(console.log)
    .catch(console.error)
    .then(dbs.close);
