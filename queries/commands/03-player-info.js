'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                lastName: 'Mustermann',
            },
        },
        {
            $lookup: {
                from: 'marketvalueupdate',
                let: { player_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$playerId', '$$player_id'],
                            },
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
                from: 'contracts',
                let: { player_id: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
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
                                $subtract: [ISODate(), '$dateofbirth'],
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
