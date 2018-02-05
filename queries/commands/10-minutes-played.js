'use strict';

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Jérôme',
                lastName: 'Boateng'
            }
        },
        {
            $lookup: {
                from: 'statistics',
                let: {
                    player_ID: '$_id',
                    firstName: '$firstName',
                    lastName: '$lastName',
                    birthday: '$dateOfBirth'
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
                                        $eq: ['$playerId', '$$player_ID']
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
                as: 'stats'
            }
        },
        {
            $project: {
                _id: 1,
                firstName: 1,
                lastName: 1,
                dateOfBirth: 1,
                minutes: { $sum: '$stats.minutes' }
            }
        }
    ],
    cursor: {
        batchSize: 50
    }
};
