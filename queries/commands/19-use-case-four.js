'use strict';

const { ObjectId, ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Junior',
                lastName: 'Stanislas',
            },
        },
        {
            $lookup: {
                from: 'statistics',
                let: { playerId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$type', 'event'] },
                                    { $eq: ['$playerId', '$$playerId'] },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            fantasy: 0,
                        },
                    },
                ],
                as: 'events',
            },
        },
        {
            $lookup: {
                from: 'statistics',
                let: { playerId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$type', 'statistic'] },
                                    { $gt: ['$minutes', 0] },
                                    { $eq: ['$playerId', '$$playerId'] },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            fantasy: 0,
                        },
                    },
                ],
                as: 'statistics',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: { playerId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$contractType', 'player'] },
                                    { $eq: ['$playerId', '$$playerId'] },
                                    { $lte: ['$startDate', ISODate()] },
                                    { $gte: ['$endDate', ISODate()] },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'teams',
                            localField: 'teamId',
                            foreignField: '_id',
                            as: 'Team',
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            club: '$Team.name',
                            country: '$Team.country',
                            city: '$Team.city',
                            salary: '$salary',
                        },
                    },
                ],
                as: 'currentContract',
            },
        },
        {
            $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                nationality: 1,
                dateOfBirth: 1,
                currentContract: 1,
                // events: 0,
                yellowCards: {
                    $size: {
                        $filter: {
                            input: '$events',
                            as: 'ev',
                            cond: {
                                $eq: ['$$ev.eventType', 'Yellow Card'],
                            },
                        },
                    },
                },
                yellowRedCards: {
                    $size: {
                        $filter: {
                            input: '$events',
                            as: 'ev',
                            cond: {
                                $eq: ['$$ev.eventType', 'Yellow Red Card'],
                            },
                        },
                    },
                },
                redCards: {
                    $size: {
                        $filter: {
                            input: '$events',
                            as: 'ev',
                            cond: {
                                $eq: ['$$ev.eventType', 'Red Card'],
                            },
                        },
                    },
                },
                goals: {
                    $size: {
                        $filter: {
                            input: '$events',
                            as: 'ev',
                            cond: {
                                $eq: ['$$ev.eventType', 'Goal'],
                            },
                        },
                    },
                },
                totalGames: {
                    $size: '$statistics',
                },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
