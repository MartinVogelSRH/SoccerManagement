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
                                        ObjectId('5a76e6133d9ea10b4b03af19'),
                                    ],
                                },
                                {
                                    $eq: [
                                        '$homeTeamId',
                                        ObjectId('5a76e6133d9ea10b4b03af19'),
                                    ],
                                },
                            ],
                        },
                        {
                            $gte: [
                                '$startDate',
                                ISODate('2016-08-14 02:00:00.000'),
                            ],
                        },
                        {
                            $lte: [
                                '$startDate',
                                ISODate('2017-05-29 02:00:00.000'),
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
