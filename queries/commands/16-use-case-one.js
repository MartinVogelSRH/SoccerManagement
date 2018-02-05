'use strict';

module.exports = {
    aggregate: 'competitions',
    pipeline: [
        {
            $match: {
                name: 'Bundesliga',
                season: '2016/2017'
            }
        },
        {
            $lookup: {
                from: 'games',
                localField: '_id',
                foreignField: 'competitionId',
                as: 'games'
            }
        },
        {
            $unwind: '$games'
        },
        { $replaceRoot: { newRoot: '$games' } },
        { $limit: 1 },
        {
            $lookup: {
                from: 'statistics',
                let: { origGame: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$gameId', '$$origGame'] },
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
                            let: {
                                origGame: '$$origGame',
                                playerId: '$playerId'
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                {
                                                    $eq: [
                                                        '$gameId',
                                                        '$$origGame'
                                                    ]
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
                                $size: '$Goals'
                            }
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
            $sort: { goals: -1 }
        },
        {
            $limit: 5
        }
    ],
    cursor: {
        batchSize: 200
    }
};
