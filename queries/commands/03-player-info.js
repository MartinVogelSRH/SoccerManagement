'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Nickolas',
                lastName: 'Barrows',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: { player_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$type', 'marketvalue'],
                                    },
                                    {
                                        $eq: ['$playerId', '$$player_id'],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $sort: {
                            date: -1,
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                as: 'marketValues',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: { player_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$contractType', 'player'],
                                    },
                                    {
                                        $eq: ['$playerId', '$$player_id'],
                                    },
                                    {
                                        $lte: ['$startDate', ISODate()],
                                    },
                                    {
                                        $gte: ['$endDate', ISODate()],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ],
                as: 'contracts',
            },
        },
        {
            $project: {
                _id: 0,
                age: {
                    $trunc: {
                        $divide: [
                            {
                                $subtract: [ISODate(), '$dateOfBirth'],
                            },
                            31536000000,
                        ],
                    },
                },
                firstName: 1,
                lastName: 1,
                marketValues: 1,
                contracts: 1,
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
