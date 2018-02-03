'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');

const faker = require('./faker');

const db = monk('localhost/fake-football-data');

const insert = value => {
    const make = data => _.assign({ _id: monk.id() }, data);
    if (_.isArray(value)) {
        return _.map(value, make);
    }
    return make(value);
};

const tasks = {
    teams: () => {
        const teams = _.times(2, () => faker.fakeTeam());
        return insert(teams);
        // return db.get('teams').insert(teams);
    },
    players: () => {
        const players = _.times(22, () => faker.fakePlayer());
        return insert(players);
        // return db.get('people').insert(players);
    },
    managers: () => {
        const managers = _.times(2, () => faker.fakeManager());
        return insert(managers);
        // return db.get('people').insert(managers);
    },
    competition: [
        'teams', results => {
            const teamIds = _.map(results.teams, '_id');
            const competition = faker.fakeCompetition({ teamIds });
            return insert(competition);
            // return db.get('competitions').insert(competition);
        }
    ],
    marketvalues: [
        'players', results => {
            const marketvalues = _.map(results.players, player => {
                const playerId = player._id;
                return faker.fakeMarketValue({ playerId });
            });
            return insert(marketvalues);
            // return db.get('contracts').insert(marketvalues);
        }
    ],
    contracts: [
        'teams', 'players', 'managers', results => {
            const players = _.chunk(results.players, results.players.length / results.teams.length);
            const contracts = _.flatMap(results.teams, (team, i) => {
                const teamId = team._id;
                const persons = _.concat(players[i], [results.managers[i]]);
                return _.map(persons, person => {
                    const personId = person._id;
                    return faker.fakeContract({ teamId, personId });
                });
            });
            return insert(contracts);
            // return db.get('contracts').insert(contracts);
        }
    ],
    game: [
        'teams', 'competition', results => {
            const competitionId = results.competition._id;
            const homeTeamId = results.teams[0]._id;
            const awayTeamId = results.teams[1]._id;
            const game = faker.fakeGame({ competitionId, homeTeamId, awayTeamId });
            return insert(game);
            // return db.get('games').insert(game);
        }
    ],
    events: [
        'players', 'contracts', 'game', results => {
            const gameId = results.game._id;
            const map = _.keyBy(results.contracts, 'personId');
            const players = _.sampleSize(results.players, _.random(results.players.length));
            const events = _.map(players, player => {
                const playerId = player._id;
                const { teamId } = map[playerId];
                return faker.fakeEvent({ gameId, teamId, playerId });
            });
            return insert(events);
            // return db.get('statistics').insert(events);
        }
    ],
    statistics: [
        'players', 'contracts', 'game', results => {
            const gameId = results.game._id;
            const map = _.keyBy(results.contracts, 'personId');
            const statistics = _.map(results.players, player => {
                const playerId = player._id;
                const { teamId } = map[playerId];
                return faker.fakeStatistic({ gameId, teamId, playerId });
            });
            return insert(statistics);
            // return db.get('statistics').insert(statistics);
        }
    ],
    awards: [
        'managers', 'players', 'game', results => {
            const gameId = results.game._id;
            const player = _.sample(results.players);
            const manOfMatch = faker.fakeAward({ gameId, personId: player._id, type: 'Man of the match' });

            const manager = _.sample(results.managers);
            const managerOfMonth = faker.fakeAward({ personId: manager._id, type: 'Manager of the month' });

            return insert([manOfMatch, managerOfMonth]);
            // return db.get('contracts').insert([manOfMatch, managerOfMonth]);
        }
    ],
};


auto(tasks).then(console.log)
    .catch(console.error)
    .then(db.close);
