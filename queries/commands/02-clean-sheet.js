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
                                        $gte: [
                                            '$startDate',
                                            ISODate('2015-06-13 00:00:00.000')
                                        ]
                                    },
                                    {
                                        $lte: [
                                            '$startDate',
                                            ISODate('2016-06-13 00:00:00.000')
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
                as: 'Games'
            }
        },
        { $unwind: '$Games' },
        { $replaceRoot: { newRoot: '$Games' } },
        {
            $lookup: {
                from: 'statistics',
                let: { event: '$_id', team: '$team', name: '$name' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    {
                                        $and: [
                                            {
                                                $eq: ['$gameId', '$$event']
                                            },
                                            {
                                                $eq: ['$teamId', '$$team']
                                            },
                                            {
                                                $eq: ['$description', 'OwnGoal']
                                            }
                                        ]
                                    },
                                    {
                                        $and: [
                                            {
                                                $eq: ['$gameId', '$$event']
                                            },
                                            {
                                                $ne: ['$teamId', '$$team']
                                            },
                                            {
                                                $eq: ['$description', 'Goal']
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
            $group: { _id: { name: '$name' }, count: { $sum: 1 } }
        }
    ],
    cursor: {
        batchSize: 50
    }
};
