'use strict';

const { ObjectId, ISODate } = require('./utils');

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
                                    $eq: [
                                        '$awayTeamId',
                                        ObjectId('5a71931a697c49295702bed1'),
                                    ],
                                },
                                {
                                    $eq: [
                                        '$homeTeamId',
                                        ObjectId('5a71931a697c49295702bed1'),
                                    ],
                                },
                            ],
                        },
                        {
                            $gte: [
                                '$startDate',
                                ISODate('2015-06-13 00:00:00.000'),
                            ],
                        },
                        {
                            $lte: [
                                '$startDate',
                                ISODate('2016-06-13 00:00:00.000'),
                            ],
                        },
                    ],
                },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
