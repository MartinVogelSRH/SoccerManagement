'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $eq: ['$type', 'contract']
                        },
                        {
                            $eq: ['$contractType', 'player']
                        },
                        {
                            $lte: ['$startDate', ISODate()]
                        },
                        {
                            $gte: ['$endDate', ISODate()]
                        }
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$teamId',
                bill: { $sum: { $trunc: { $divide: ['$salary', 52] } } }
            }
        },
        {
            $lookup: {
                from: 'teams',
                foreignField: '_id',
                localField: '_id',
                as: 'team'
            }
        },
        { $sort: { bill: -1 } },
        {
            $project: {
                _id: 0,
                bill: 1,
                'team.type': 1,
                'team.name': 1,
                'team.city': 1,
                'team.country': 1
            }
        }
    ],
    cursor: {
        batchSize: 50
    }
};
