'use strict';

const { ObjectId, ISODate } = require('./utils');

const defenders = [
    'Centre Back',
    'Left Back',
    'Right Back',
    'Left Wing Back',
    'Right Wing Back',
];

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                type: 'statistic',
                position: { $in: defenders },
            },
        },
        { $group: { _id: '$playerId' } },
        {
            $lookup: {
                from: 'statistics',
                let: {
                    playerId: '$_id',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$type', 'event'],
                                    },
                                    {
                                        $eq: ['$eventType', 'Goal'],
                                    },
                                    {
                                        $eq: ['$playerId', '$$playerId'],
                                    },
                                ],
                            },
                        },
                    },
                ],
                as: 'goals',
            },
        },
        { $group: { _id: '$_id', goals: { $sum: 1 } } },
        {
            $sort: {
                goals: -1,
            },
        },
        {
            $limit: 5,
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
