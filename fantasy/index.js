'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const moment = require('moment');
const config = require('config');

const FantasyData = require('./fantasy-data');

const series = (collection, iteratee) =>
    _.reduce(
        collection,
        (promise, value, index) => promise.then(() => iteratee(value, index)),
        Promise.resolve()
    );

const batched = (collection, size, iteratee) =>
    series(_.chunk(collection, 10), chunk =>
        Promise.all(_.map(chunk, iteratee))
    );

const basic = (db, fantasyData) =>
    auto({
        teams: () => {
            const collection = db.get('teams');
            return fantasyData.teams().then(data => collection.insert(data));
        },
        players: () => {
            const collection = db.get('players');
            return fantasyData.players().then(data => collection.insert(data));
        },
        competitions: () => {
            const collection = db.get('hierarchy');
            return fantasyData
                .competitionHierarchy()
                .then(data => collection.insert(data));
        },
        memberships: () => {
            const collection = db.get('memberships');

            const active = fantasyData
                .activeMemberships()
                .then(data => collection.insert(data));
            const historical = fantasyData
                .historicalMemberships()
                .then(data => collection.insert(data));
            return Promise.all([active, historical]);
        },
    });

const rounded = (db, fantasyData) =>
    auto({
        rounds: () => db.get('rounds').distinct('RoundId'),
        schedule: [
            'rounds',
            r => {
                const collection = db.get('schedule');
                return Promise.all(
                    _.map(r.rounds, id =>
                        fantasyData
                            .schedule(id)
                            .then(data => collection.insert(data))
                    )
                );
            },
        ],
        standings: [
            'rounds',
            r => {
                const collection = db.get('standings');
                return Promise.all(
                    _.map(r.rounds, id =>
                        fantasyData
                            .standings(id)
                            .then(data => collection.insert(data))
                    )
                );
            },
        ],
        stats: [
            'rounds',
            r => {
                const collection = db.get('stats');
                return Promise.all(
                    _.map(r.rounds, id =>
                        Promise.all([
                            fantasyData
                                .teamSeasonStats(id)
                                .then(data =>
                                    collection.insert(
                                        _.map(data, o =>
                                            _.defaults(
                                                { _type: 'teamSeasonStat' },
                                                o
                                            )
                                        )
                                    )
                                ),
                            fantasyData
                                .playerSeasonStats(id)
                                .then(data =>
                                    collection.insert(
                                        _.map(data, o =>
                                            _.defaults(
                                                { _type: 'playerSeasonStat' },
                                                o
                                            )
                                        )
                                    )
                                ),
                        ])
                    )
                );
            },
        ],
    });

const dated = (db, fantasyData) =>
    auto({
        days: () =>
            db
                .get('schedule')
                .distinct('Day')
                .then(days => {
                    const today = moment();
                    return _.chain(days)
                        .map(day => moment(_.replace(day, /T.*$/, '')))
                        .filter(day => day.isSameOrBefore(today, 'day'))
                        .map(date => date.format('YYYY-MM-DD'))
                        .sortBy()
                        .value();
                }),
        boxScores: [
            'days',
            r => {
                const collection = db.get('boxScores');
                return batched(r.days, 10, day =>
                    fantasyData
                        .boxScores(day)
                        .then(data => collection.insert(data))
                        .catch(err => console.log(day, `Error:`, err.message))
                );
            },
        ],
    });

const uri = config.get('databases.fantasy');
monk(uri).then(db => {
    console.log('Conneced to', uri);
    const subscriptionKeys = config.get('fantasy.subscriptionKeys');
    const fantasyData = FantasyData({ subscriptionKeys });
    /* run one of the tasks above here, e.g. basic(db, fantasyData) */
    return dated(db, fantasyData)
        .catch(console.error)
        .then(() => db.close());
});
