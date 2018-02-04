'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                description: { $regex: /Card$/, $options: 'i' },
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
            $group: {
                _id: {
                    teamId: '$teamId',
                    team: '$Team',
                    description: '$description',
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { count: -1 },
        },
    ],
    cursor: {
        batchSize: 10,
    },
};
