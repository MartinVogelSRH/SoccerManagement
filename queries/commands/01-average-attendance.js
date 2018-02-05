'use strict';

const { ObjectId, ISODate, FCB } = require('./utils');

module.exports = {
    aggregate: 'games',
    pipeline: [
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $or: [
                                {
                                    $eq: ['$awayTeamId', ObjectId(FCB)]
                                },
                                {
                                    $eq: ['$homeTeamId', ObjectId(FCB)]
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
        }
    ],
    cursor: {
        batchSize: 50
    }
};
