'use strict';

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Lewis',
                lastName: 'Holtby'
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
    cursor: {}
};
