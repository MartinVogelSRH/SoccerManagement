'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Thomas',
                lastName: 'Müller',
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
                        $lookup: {
                            from: 'teams',
                            foreignField: '_id',
                            localField: 'teamId',
                            as: 'team',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            playerId: 0,
                            type: 0,
                            contractType: 0,
                            teamId: 0,
                            'team._id': 0,
                            'team.fantasy': 0,
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
