'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'teams',
    pipeline: [
        {
            $match: {
                name: 'FC Bayern München',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: { team_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$type', 'contract'] },
                                    { $eq: ['$contractType', 'player'] },
                                    { $eq: ['$teamId', '$$team_id'] },
                                    {
                                        $lt: [
                                            '$startDate',
                                            ISODate('2018-02-04T16:02:01.718Z'),
                                        ],
                                    },
                                    {
                                        $gt: [
                                            '$endDate',
                                            ISODate('2018-02-04T16:02:01.718Z'),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            playerId: 1,
                        },
                    },
                ],
                as: 'players',
            },
        },
        {
            $lookup: {
                from: 'statistics',
                let: { team_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$type', 'statistic'] },
                                    { $lte: ['$playerId', null] },
                                    { $eq: ['$teamId', '$$team_id'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'statistics',
            },
        },
        {
            $lookup: {
                from: 'statistics',
                let: { team_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$type', 'event'] },
                                    { $eq: ['$teamId', '$$team_id'] },
                                ],
                            },
                        },
                    },
                ],
                as: 'events',
            },
        },
        {
            $project: {
                _id: 1,
                type: 1,
                name: 1,
                country: 1,
                city: 1,
                players: { $size: '$players' },
                games: { $size: '$statistics' },
                possession: { $avg: '$statistics.possession' },
                shots: { $avg: '$statistics.shots' },
                shotsOnGoal: { $avg: '$statistics.shotsOnGoal' },
                crosses: { $avg: '$statistics.crosses' },
                tacklesWon: { $avg: '$statistics.tacklesWon' },
                interceptions: { $avg: '$statistics.interceptions' },
                fouls: { $avg: '$statistics.fouls' },
                fouled: { $avg: '$statistics.fouled' },
                offsides: { $avg: '$statistics.offsides' },
                passes: { $avg: '$statistics.passes' },
                passesCompleted: { $avg: '$statistics.passesCompleted' },
                blockedShots: { $avg: '$statistics.blockedShots' },
                touches: { $avg: '$statistics.touches' },
                events: {
                    $reduce: {
                        input: '$events',
                        initialValue: {
                            substitutions: 0,
                            goals: 0,
                            penaltyGoals: 0,
                            yellowCards: 0,
                            yellowRedCards: 0,
                            redCards: 0,
                        },
                        in: {
                            substitutions: {
                                $add: [
                                    '$$value.substitutions',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Substitution',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                            goals: {
                                $add: [
                                    '$$value.goals',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Goal',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                            penaltyGoals: {
                                $add: [
                                    '$$value.penaltyGoals',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Penalty Goal',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                            yellowCards: {
                                $add: [
                                    '$$value.yellowCards',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Yellow Card',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                            yellowRedCards: {
                                $add: [
                                    '$$value.yellowRedCards',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Yellow Red Card',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                            redCards: {
                                $add: [
                                    '$$value.redCards',
                                    {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$$this.eventType',
                                                    'Red Card',
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
