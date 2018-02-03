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

const counter = 0;
const spinner = ora().start('Starting ...');


const parser = {
    date: date => moment.utc(_.replace(date, /T.*$/, '')).toDate(),
    datetime: datetime => moment.utc(_.replace(datetime, /Z?$/, 'Z')).toDate()
};

const cache = {
    store: {},
    get: (type, id) => cache.store[type] && cache.store[type][id],
    set: (type, id, value) => {
        if (!cache.store[type]) {
            cache.store[type] = {};
        }
        cache.store[type][id] = value;
        return value;
    },
    pick: (type, ids) => _.pick(cache.store[type], ids),
    assign: (type, obj) => {
        cache.store[type] = _.assign(cache.store[type], obj);
        return obj;
    },
};


const run = ({ Game, Lineups, PlayerGames }) => {
    const fantasyPlayerIds = _.union(
        _.map(PlayerGames, 'PlayerId'),
        _.compact(_.flatMap(Lineups, l => [l.PlayerId, l.ReplacedPlayerId]))
    );
    if (_.isEmpty) {
        spinner.info(`No players in game ${Game.GameId}`);
        return Promise.resolve();
    }

    return auto({
        gameId: () => mappings.forId('game', Game.RoundId),
        competitionId: () => mappings.forId('round', Game.RoundId, true),
        teams: () => mappings.forIds('team', [Game.AwayTeamId, Game.HomeTeamId], true),
        fantasyPlayerIds: () => _.union(
            _.map(PlayerGames, 'PlayerId'),
            _.compact(_.flatMap(Lineups, l => [l.PlayerId, l.ReplacedPlayerId]))
        ),
        players: () => mappings.forIds('player', fantasyPlayerIds),
        statistics: [
            'gameId',
            'competitionId',
            'teams',
            'players',
            ({ gameId, competitionId, teams }) => {
                const playerGameMap = _.keyBy(PlayerGames, 'PlayerId');
                const fantasyLineupMap = _.keyBy(Lineups, 'PlayerId');
            }
        ],
    });
};


dbs.fantasy
    .get('boxScores')
    .findOne({})
    .then(x => run(x))
    // .find({})
    // .each((x, { close, pause, resume }) => {
    //     pause();
    //     counter += 1;
    //     lastGameId = x.Game.GameId;
    //     spinner.text = `#${counter} (${lastGameId})`;
    //     return run(x)
    //         .then(() => resume())
    //         .catch(() => close());
    // })
    .then(() => spinner.succeed(`Finished ${counter} games`))
    .catch(err => {
        spinner.fail(err);
        console.error(err);
    })
    .then(dbs.close);
