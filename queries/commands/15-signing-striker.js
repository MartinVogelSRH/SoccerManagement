'use strict';

const { ObjectId, ISODate } = require('./utils');

module.exports = {
    aggregate: 'games',
    pipeline: [
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $gte: [
                                '$startDate',
                                ISODate('2018-01-22T00:00:00.166Z')
                            ]
                        },
                        {
                            $lte: [
                                '$endDate',
                                ISODate('2018-01-28T23:59:59.166Z')
                            ]
                        }
                    ]
                }
            }
        },
        {
            $lookup: {
                from: 'statistics',
                let: { gameId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$gameId', '$$gameId'] },
                                    { $eq: ['$type', 'statistic'] },
                                    {
                                        $in: [
                                            '$position',
                                            [
                                                'Centre Forward',
                                                'Withdrawn Striker'
                                            ]
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'statistics',
                            let: { gameId: '$$gameId', playerId: '$playerId' },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: ['$gameId', '$$gameId']
                                                },
                                                { $eq: ['$type', 'event'] },
                                                {
                                                    $eq: [
                                                        '$playerId',
                                                        '$$playerId'
                                                    ]
                                                },
                                                {
                                                    $in: [
                                                        '$eventType',
                                                        ['Goal', 'Penalty Goal']
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: 'Goals'
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            playerId: 1,
                            goals: {
                                $size: {
                                    $filter: {
                                        input: '$Goals',
                                        as: 'ev',
                                        cond: {
                                            $eq: ['$$ev.eventType', 'Goal']
                                        }
                                    }
                                }
                            },
                            penaltyGoals: {
                                $size: {
                                    $filter: {
                                        input: '$Goals',
                                        as: 'ev',
                                        cond: {
                                            $eq: [
                                                '$$ev.eventType',
                                                'Penalty Goal'
                                            ]
                                        }
                                    }
                                }
                            },
                            shots: 1,
                            shotsOnGoal: 1,
                            tacklesWon: 1,
                            offsides: 1,
                            touches: 1,
                            minutes: 1
                        }
                    }
                ],
                as: 'playerStats'
            }
        },
        {
            $unwind: '$playerStats'
        },
        { $replaceRoot: { newRoot: '$playerStats' } },
        {
            $group: {
                _id: '$playerId',
                shots: { $sum: '$shots' },
                shotsOnGoal: { $sum: '$shotsOnGoal' },
                tacklesWon: { $sum: '$tacklesWon' },
                offsides: { $sum: '$offsides' },
                touches: { $sum: '$touches' },
                minutes: { $sum: '$minutes' },
                goals: { $sum: '$goals' },
                penaltyGoals: { $sum: '$penaltyGoals' },
                games: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'people',
                localField: '_id',
                foreignField: '_id',
                as: 'Striker'
            }
        },
        {
            $project: {
                FirstName: '$Striker.firstName',
                LastName: '$Striker.lastName',
                shots: '$shots',
                shotsOnGoal: '$shotsOnGoal',
                tacklesWon: '$tacklesWon',
                offsides: '$offsides',
                touches: '$touches',
                minutes: '$minutes',
                games: '$games',
                goals: '$goals',
                penatlyGoals: '$penaltyGoals',
                minutespergoal: {
                    $cond: [
                        { $gt: ['$goals', 0] },
                        { $divide: ['$minutes', '$goals'] },
                        0
                    ]
                },
                minutespergame: {
                    $cond: [
                        { $gt: ['$minutes', 0] },
                        { $divide: ['$games', '$minutes'] },
                        0
                    ]
                },
                score: {
                    $sum: [
                        {
                            $cond: [
                                { $gt: ['$goals', 0] },
                                { $divide: ['$goals', '$games'] },
                                0
                            ]
                        },
                        {
                            $cond: [
                                { $gt: ['$shotsOnGoal', 0] },
                                { $divide: ['$goals', '$shotsOnGoal'] },
                                '$shotsOnGoal'
                            ]
                        },
                        {
                            $cond: [
                                { $gt: ['$shots', 0] },
                                { $divide: ['$shotsOnGoal', '$shots'] },
                                '$shots'
                            ]
                        },
                        {
                            $cond: [
                                { $gt: ['$offsides', 0] },
                                { $divide: ['$shotsOnGoal', '$offsides'] },
                                '$offsides'
                            ]
                        }
                    ]
                }
            }
        },
        {
            $sort: { score: -1 }
        },
        {
            $limit: 10
        }
    ],
    cursor: {
        batchSize: 200
    }
};
