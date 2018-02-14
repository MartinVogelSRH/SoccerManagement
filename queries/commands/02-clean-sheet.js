'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'teams',
    pipeline: [
        {
            $match: {
                name: '1. FC Köln'
            }
        },
        {
            $lookup: {
                from: 'games',
                let: { team: '$_id', name: '$name' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $or: [
                                            {
                                                $eq: ['$awayTeamId', '$$team']
                                            },
                                            {
                                                $eq: ['$homeTeamId', '$$team']
                                            }
                                        ]
                                    },
                                    {
                                        $gte: ['$startDate', ISODate('2017-08-01 00:00:00.000')]
                                    },
                                    {
                                        $lte: ['$startDate', ISODate('2018-08-01 00:00:00.000')]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            team: '$$team',
                            name: '$$name'
                        }
                    }
                ],
                as: 'Games'
            }
        },
        { $unwind: '$Games' },
        { $replaceRoot: { newRoot: '$Games' } },
        {
            $lookup: {
                from: 'statistics',
                let: { gameId: '$_id', team: '$team', name: '$name' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $eq: ['$gameId', '$$gameId']
                                            },
                                            {
                                                $eq: ['$teamId', '$$team']
                                            },
                                            {
                                                $eq: ['$eventType', 'OwnGoal']
                                            }
                                        ]
                                    },
                                    {
                                        $and: [
                                            {
                                                $eq: ['$gameId', '$$gameId']
                                            },
                                            {
                                                $ne: ['$teamId', '$$team']
                                            },
                                            {
                                                $eq: ['$eventType', 'Goal']
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            team: '$$team',
                            name: '$$name'
                        }
                    }
                ],
                as: 'events'
            }
        },
        {
            $match: {
                $expr: {
                    $eq: ['$events', []]
                }
            }
        },
        {
            $group: { _id: '$name', count: { $sum: 1 } }
        }
    ],
    cursor: {}
};
