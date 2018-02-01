'use strict';

/*
 * TODO:
 * Convert to Event: Bookings (Cards), Goals, PenaltyShootouts
 * Convert to statistics: PlayerGames, TeamGames
 * Other fileds? Lineups, Referees
 * Also how do we connect the coach with a game?
 */

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

const cached = {
    coaches: {},
};

const buildCoach = fantasy => {
    if (cached.coaches[fantasy.CoachId]) {
        return null;
    }

    const _id = monk.id();
    const type = 'coach';
    const firstName = fantasy.FirstName;
    const lastName = fantasy.LastName;
    const nationality = fantasy.Nationality;

    cached.coaches[fantasy.CoachId] = _id;
    return { _id, type, firstName, lastName, nationality };
};

const getMap = (type, ids) =>
    dumpDB
        .get('mappings')
        .find({ type, fantasyId: { $in: ids } })
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

const run = box =>
    auto({
        teams: () => getMap('team', [box.Game.AwayTeamId, box.Game.HomeTeamId]),
        // players: () => getMap('player', _.map(box.Lineups, 'PlayerId')),
        competition: () =>
            dumpDB
                .get('rounds')
                .findOne({ RoundId: box.Game.RoundId })
                .then(round =>
                    dumpDB
                        .get('mappings')
                        .findOne({ type: 'season', fantasyId: round.SeasonId })
                        .then(mapping => {
                            const r = {};
                            r[box.Game.RoundId] = mapping.objectId;
                            return r;
                        })
                ),
        coaches: () => {
            const coaches = [];
            const mappings = [];

            const awayTeamCoachId = _.get(box, ['AwayTeamCoach', 'CoachId']);
            if (awayTeamCoachId) {
                const awayTeamCoach = buildCoach(box.AwayTeamCoach);
                if (awayTeamCoach) {
                    coaches.push(awayTeamCoach);
                    mappings.push(
                        MappingService.build(
                            'coach',
                            awayTeamCoachId,
                            awayTeamCoach._id
                        )
                    );
                }
            }

            const homeTeamCoachId = _.get(box, ['HomeTeamCoach', 'CoachId']);
            if (homeTeamCoachId) {
                const homeTeamCoach = buildCoach(box.HomeTeamCoach);
                if (homeTeamCoach) {
                    coaches.push(homeTeamCoach);
                    mappings.push(
                        MappingService.build(
                            'coach',
                            homeTeamCoachId,
                            homeTeamCoach._id
                        )
                    );
                }
            }

            if (_.isEmpty(coaches)) {
                return Promise.resolve();
            }

            return Promise.all([
                footballDB.get('people').insert(coaches),
                MappingService.insert(mappings),
            ]);
        },
        game: [
            'teams',
            'competition',
            ({ teams, competition }) => {
                const competitionId = competition[box.Game.RoundId];
                const awayTeamId = teams[box.Game.AwayTeamId];
                const homeTeamId = teams[box.Game.AwayTeamId];
                if (!competitionId || !awayTeamId || !homeTeamId) {
                    return Promise.resolve();
                }

                const _id = monk.id();

                // const visitors = Game.Attendance;
                const startDate = moment
                    .utc(_.replace(box.Game.DateTime, /Z?$/, 'Z'))
                    .toDate();

                const game = footballDB.get('games').insert({
                    _id,
                    competitionId,
                    awayTeamId,
                    homeTeamId,
                    startDate,
                    // visitors,
                });

                const mapping = MappingService.insert(
                    MappingService.build('game', box.Game.GameId, _id)
                );

                return Promise.all([game, mapping]);
            },
        ],
    });

let counter = 0;
const spinner = ora().start('Starting ...');
dumpDB
    .get('boxScores')
    .find({})
    .each((box, { close, pause, resume }) => {
        pause();
        counter += 1;
        spinner.text = `#${counter}/12077`;
        return run(box).then(() => resume());
    })
    .then(console.log)
    .catch(console.error)
    .then(exit, exit);
