'use strict';

const { ISODate } = require('./utils');

module.exports = {
    aggregate: 'contracts',
    pipeline: [
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $lte: ['$startDate', ISODate()],
                        },
                        {
                            $gte: ['$endDate', ISODate()],
                        },
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$teamId',
                count: { $sum: { $divide: ['$wage', 52] } },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
