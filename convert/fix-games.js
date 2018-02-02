'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const moment = require('moment');
const config = require('config');

const ora = require('ora');

const dbs = {
    fantasy: monk(config.get('databases.fantasy')),
    football: monk(config.get('databases.football')),
    close: () =>
        Promise.all([dbs.fantasy.close(), dbs.football.close()])
};

const collections = {
    mappings: dbs.fantasy.get('mappings'),
    rounds: dbs.fantasy.get('rounds'),
    seasons: dbs.fantasy.get('seasons'),
    games: dbs.football.get('games'),
    competitions: dbs.football.get('competitions'),
};

let counter = 0;
let lastGameId = 0;
const spinner = ora().start('Starting ...');

const store = {
    get: (type, id) => store.cache[type] && store.cache[type][id],
    set: (type, id, value) => {
        if (!store.cache[type]) {
            store.cache[type] = {};
        }
        store.cache[type][id] = value;
        return value;
    },
    cache: {}
};

const buildDate = date => moment.utc(_.replace(date, /T.*$/, '')).toDate();

const teams = {
    getFromTeamId: TeamId => {
        const cached = store.get('team', TeamId);
        if (cached) {
            return Promise.resolve(cached);
        }

        return collections.mappings
            .findOne({ type: 'team', fantasyId: TeamId })
            .then(({ objectId }) => store.set('team', TeamId, objectId));
    }
};

const competitions = {
    getFromSeasonId: SeasonId => {
        const cached = store.get('season', SeasonId);
        if (cached) {
            return Promise.resolve(cached);
        }

        return collections.seasons.findOne({ SeasonId })
            .then(season => {
                const query = { name: season.CompetitionName, season: season.Name };
                const update = { startDate: buildDate(season.StartDate), endDate: buildDate(season.EndDate) };
                return collections.competitions.findOneAndUpdate(query, { $set: update });
            })
            .then(comp => {
                const competitionId = comp && comp._id;
                if (!competitionId) {
                    spinner.info(`Could not find competition for SeasonId ${SeasonId}`);
                    return null;
                }

                store.set('season', SeasonId, competitionId);

                const query = { type: 'season', fantasyId: SeasonId };
                const update = { objectId: competitionId };
                return collections.mappings.findOneAndUpdate(query, { $set: update })
                    .then(() => competitionId);
            });
    },
    getFromRoundId: RoundId => {
        const cached = store.get('round', RoundId);
        if (cached) {
            return Promise.resolve(cached);
        }

        return collections.rounds
            .findOne({ RoundId }, 'SeasonId')
            .then(({ SeasonId }) => competitions.getFromSeasonId(SeasonId))
            .then(competitionId => {
                if (!competitionId) {
                    return null;
                }

                store.set('season', RoundId, competitionId);
                return collections.mappings.insert({ type: 'round', fantasyId: RoundId, objectId: competitionId })
                    .then(() => competitionId);
            });
    }
};

const run = fantasyGame =>
    auto({
        awayTeamId: () => teams.getFromTeamId(fantasyGame.AwayTeamId),
        homeTeamId: () => teams.getFromTeamId(fantasyGame.HomeTeamId),
        competitionId: () => competitions.getFromRoundId(fantasyGame.RoundId),
        game: [
            'awayTeamId',
            'homeTeamId',
            'competitionId',
            ({ awayTeamId, homeTeamId, competitionId }) => {
                if (!awayTeamId || !homeTeamId || !competitionId) {
                    spinner.info(`Could not find awayTeamId (${awayTeamId}) or homeTeamId (${homeTeamId}) or competitionId (${competitionId}) for GameId ${fantasyGame.GameId}`);
                    return null;
                }

                const startDate = moment
                    .utc(_.replace(fantasyGame.DateTime, /Z?$/, 'Z'))
                    .toDate();

                const query = { awayTeamId, startDate };
                const update = { competitionId, homeTeamId };
                return collections.games.findOneAndUpdate(query, { $set: update })
                    .then(game => {
                        const gameId = game && game._id;
                        if (!gameId) {
                            spinner.info(`Could not find game for GameId ${fantasyGame.GameId}`);
                            return null;
                        }

                        const query = { type: 'game', fantasyId: fantasyGame.GameId };
                        const update = { objectId: gameId };
                        return collections.mappings.findOneAndUpdate(query, { $set: update });
                    });
            }
        ],
    });

dbs.fantasy
    .get('boxScores')
    // .findOne({}, { _id: 0, 'Game.GameId': 1, 'Game.RoundId': 1, 'Game.AwayTeamId': 1, 'Game.HomeTeamId': 1, 'Game.DateTime': 1 })
    // .then(({ Game }) => run(Game))
    .find({}, { _id: 0, 'Game.GameId': 1, 'Game.RoundId': 1, 'Game.AwayTeamId': 1, 'Game.HomeTeamId': 1, 'Game.DateTime': 1 })
    .each(({ Game }, { close, pause, resume }) => {
        pause();
        counter += 1;
        lastGameId = Game.GameId;
        spinner.text = `#${counter} (${lastGameId})`;
        return run(Game)
            .then(() => resume())
            .catch(() => close());
    })
    .then(() => spinner.succeed(`Finished ${counter} games (${lastGameId})`))
    .catch(err => {
        spinner.fail(err);
        console.error(err);
    })
    .then(dbs.close);
