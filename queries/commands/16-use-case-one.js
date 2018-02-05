'use strict';

module.exports = {
    aggregate: 'competitions',
    pipeline: [
        {
            $match: {
                name: 'Bundesliga',
                season: '2016/2017',
            },
        },
        {
            $lookup: {
                from: 'games',
                localField: '_id',
                foreignField: 'competitionId',
                as: 'games',
            },
        },
        { $limit: 1 },
        {
            $unwind: '$games',
        },
        { $replaceRoot: { newRoot: '$games' } },
        {
            $lookup: {
                from: 'statistics',
                let: { gameId: '_id' },
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
                                                'Centre Back',
                                                'Left Back',
                                                'Right Back',
                                                'Left Wing Back',
                                                'Right Wing Back',
                                            ],
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    { $limit: 5 },
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
                                                    $eq: [
                                                        '$gameId',
                                                        '$$gameId',
                                                    ],
                                                },
                                                { $eq: ['$type', 'event'] },
                                                {
                                                    $eq: [
                                                        '$playerId',
                                                        '$$playerId',
                                                    ],
                                                },
                                                {
                                                    $in: [
                                                        '$eventType',
                                                        [
                                                            'Goal',
                                                            'Penalty Goal',
                                                        ],
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                            as: 'Goals',
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            playerId: 1,
                            goals: {
                                $size: '$Goals',
                            },
                        },
                    },
                ],
                as: 'playerStats',
            },
        },
        {
            $unwind: '$playerStats',
        },
        { $replaceRoot: { newRoot: '$playerStats' } },
        {
            $sort: { goals: -1 },
        },
        {
            $limit: 2,
        },
    ],
    cursor: {
        batchSize: 200,
    },
};
