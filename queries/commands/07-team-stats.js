'use strict';

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
                let: {
                    team_ID: '$_id',
                    teamName: '$name'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    {
                                        $eq: ['$homeTeamId', '$$team_ID']
                                    },
                                    {
                                        $eq: ['$awayTeamId', '$$team_ID']
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $sort: {
                            startDate: -1
                        }
                    },
                    {
                        $limit: 5
                    },
                    {
                        $project: {
                            game_id: '$_id',
                            relevantTeam: '$$team_ID',
                            homeTeam: '$homeTeamId',
                            awayTeam: '$awayTeamId',
                            startDate: 1
                        }
                    }
                ],
                as: 'games'
            }
        },
        {
            $unwind: '$games'
        },
        { $replaceRoot: { newRoot: '$games' } },
        {
            $lookup: {
                from: 'statistics',
                let: {
                    game_id: '$game_id',
                    relevantTeam: '$relevantTeam',
                    homeTeam: '$homeTeam',
                    awayTeam: '$awayTeam',
                    startDate: 'startDate',
                    teamName: '$startDate'
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$type', 'statistic']
                                    },
                                    {
                                        $eq: ['$gameId', '$$game_id']
                                    },
                                    {
                                        $eq: ['$teamId', '$$relevantTeam']
                                    },
                                    {
                                        $eq: [
                                            { $ifNull: ['$playerId', 'Unspecified'] },
                                            'Unspecified'
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            fantasy: 0
                        }
                    }
                ],
                as: 'gameStat'
            }
        }
    ],
    cursor: {}
};
