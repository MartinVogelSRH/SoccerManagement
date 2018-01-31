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

const promisedCoaches = box => {
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
    } else {
        console.log(`No AwayTeamCoach in {'Game.GameId': ${box.Game.GameId}}`);
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
    } else {
        console.log(`No HomeTeamCoach in {'Game.GameId': ${box.Game.GameId}}`);
    }

    if (_.isEmpty(coaches)) {
        return Promise.resolve();
    }

    return Promise.all([
        footballDB.get('people').insert(coaches),
        MappingService.insert(mappings),
    ]);
};

const promisedGame = (box, mappings, competitions) => {
    const { Game } = box;
    if (_.isEmpty(Game)) {
        return Promise.resolve();
    }

    const competitionId = competitions[Game.RoundId];
    const awayTeamId = _.get(mappings, ['teams', Game.AwayTeamId, 'objectId']);
    const homeTeamId = _.get(mappings, ['teams', Game.HomeTeamId, 'objectId']);
    if (!competitionId || !awayTeamId || !homeTeamId) {
        return Promise.resolve();
    }

    const _id = monk.id();
    const type = 'coach';

    const visitors = Game.Attendance;
    const startDate = moment.utc(_.replace(Game.DateTime, /Z?$/, 'Z')).toDate();

    const game = footballDB.get('people').insert({
        _id,
        competitionId,
        awayTeamId,
        homeTeamId,
        startDate,
        visitors,
    });

    const mapping = MappingService.insert(
        MappingService.build('game', Game.GameId, _id)
    );

    return Promise.all([game, mapping]);
};

const tasks = {
    rounds: () => dumpDB.get('boxScores').find({}),
    mappings: () => MappingService.get(['team', 'player', 'season']),
    competitions: [
        'rounds',
        'mappings',
        ({ rounds, mappings }) =>
            _.reduce(
                rounds,
                (o, r) => {
                    o[r.RoundId] = _.get(mappings, [
                        'season',
                        r.SeasonId,
                        'objectId',
                    ]);
                    return o;
                },
                {}
            ),
    ],
    convert: [
        'mappings',
        'competitions',
        ({ mappings, competitions }) =>
            dumpDB
                .get('boxScores')
                .find({})
                .each((box, { close, pause, resume }) => {
                    pause();

                    const promises = [];

                    const coaches = promisedCoaches(box);
                    const game = promisedGame(box, mappings, competitions);

                    return Promise.all([coaches, game]).then(() => resume());
                }),
    ],
};

auto(tasks)
    .then(console.log)
    .catch(console.error)
    .then(exit, exit);
