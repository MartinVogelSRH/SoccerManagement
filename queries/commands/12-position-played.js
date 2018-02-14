'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Mehdi Amine',
                lastName: 'El Mouttaqi Benatia'
            }
        },
        {
            $lookup: {
                from: 'people',
                let: { player: '$_id', firstName: '$firstName', lastName: '$lastName' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$playerId', '$$player']
                                    },
                                    {
                                        $eq: ['$type', 'contract']
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            player: '$$player',
                            firstName: '$$firstName',
                            lastName: '$$lastName',
                            teamId: '$teamId'
                        }
                    }
                ],
                as: 'Teams'
            }
        },
        { $unwind: '$Teams' },
        { $replaceRoot: { newRoot: '$Teams' } },
        {
            $lookup: {
                from: 'games',
                let: {
                    team: '$teamId',
                    player: '$player',
                    firstName: '$firstName',
                    lastName: '$lastName'
                },
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
                                        $gte: ['$startDate', ISODate('2016-06-13 00:00:00.000')]
                                    },
                                    {
                                        $lte: ['$startDate', ISODate('2017-06-13 00:00:00.000')]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            player: '$$player',
                            firstName: '$$firstName',
                            lastName: '$$lastName',
                            teamId: '$$team'
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
                let: {
                    game: '$_id',
                    team: '$teamId',
                    firstName: '$firstName',
                    lastName: '$lastName',
                    player: '$player'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$playerId', '$$player']
                                    },
                                    {
                                        $gt: ['$position', null]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            player: '$$player',
                            firstName: '$$firstName',
                            lastName: '$$lastName',
                            teamId: '$$team',
                            gameId: '$gameId',
                            position: '$position'
                        }
                    }
                ],
                as: 'Position'
            }
        },
        { $unwind: '$Position' },
        { $replaceRoot: { newRoot: '$Position' } },
        {
            $group: {
                _id: {
                    player: '$player',
                    firstName: '$firstName',
                    lastName: '$lastName',
                    position: '$position'
                }
            }
        }
    ],
    cursor: {}
};
