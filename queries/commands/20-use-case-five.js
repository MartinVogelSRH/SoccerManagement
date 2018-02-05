'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                eventType: 'Yellow Card'
            }
        },
        {
            $group: {
                _id: '$teamId',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { count: -1 }
        },
        { $limit: 10 },
        {
            $lookup: {
                from: 'teams',
                localField: '_id',
                foreignField: '_id',
                as: 'team'
            }
        },
        {
            $project: {
                _id: 0,
                count: 1,
                'team.type': 1,
                'team.name': 1,
                'team.city': 1,
                'team.country': 1
            }
        }
    ],
    cursor: {
        batchSize: 10
    }
};
