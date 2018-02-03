'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const moment = require('moment');
const config = require('config');

const ora = require('ora');

const MappingService = require('./mappings');

const dumpDB = monk(config.get('databases.fantasy'));
const footballDB = monk(config.get('databases.football'));
const exit = () =>
    Promise.all([dumpDB.close(), footballDB.close()]).then(() =>
        process.exit()
    );

const getFromIds = (type, ids) =>
    dumpDB
        .get('mappings')
        .find({ type, fantasyId: { $in: _.uniq(ids) } })
        .then(m =>
            _.reduce(
                m,
                (o, t) => {
                    o[t.fantasyId] = t.objectId;
                    return o;
                },
                {}
            )
        );

const getFromId = (type, id) =>
    dumpDB
        .get('mappings')
        .findOne({ type, fantasyId: id })
        .then(d => {
            const r = {};
            r[d.fantasyId] = d.objectId;
            return r;
        });

const run = ({ Game, Bookings, Goals }) => {
    const concated = _.concat(Bookings, Goals);
    return auto({
        teams: () => getFromIds('team', _.map(concated, 'TeamId')),
        players: () =>
            getFromIds(
                'player',
                _.concat(
                    _.map(concated, 'PlayerId'),
                    _.map(Goals, 'AssistedByPlayerId1')
                )
            ),
        game: () => getFromId('game', Game.GameId),
        events: [
            'teams',
            'players',
            'game',
            ({ teams, players, game }) => {
                const events = _.compact(
                    _.map(concated, e => {
                        const gameId = game[e.GameId];
                        const teamId = teams[e.TeamId];
                        const playerId = players[e.PlayerId];
                        if (!gameId || !teamId || !playerId) {
                            return null;
                        }

                        const _id = monk.id();
                        const type = 'event';

                        const description = e.Type;
                        const gameMinute = e.GameMinute;

                        const event = {
                            _id,
                            type,
                            gameId,
                            teamId,
                            playerId,
                            description,
                            gameMinute,
                        };

                        if (e.AssistedByPlayerId1) {
                            const additionalPlayerId =
                                players[e.AssistedByPlayerId1];
                            if (additionalPlayerId) {
                                event.additionalPlayerId = additionalPlayerId;
                            }
                        }

                        return event;
                    })
                );

                if (_.isEmpty(events)) {
                    return null;
                }

                return footballDB.get('statistics').insert(events);
            },
        ],
    });
};

let counter = 0;
const spinner = ora().start('Starting ...');
dumpDB
    .get('boxScores')
    .find({})
    .each((box, { close, pause, resume }) => {
        pause();
        counter += 1;
        spinner.text = `#${counter}`;
        return run(box).then(() => resume());
    })
    .then(() => spinner.succeed(`Finished #${counter}`))
    .catch(err => spinner.fail(err))
    .then(exit, exit);
