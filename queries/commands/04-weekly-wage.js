'use strict';

const { ISODate } = require('./utils');

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
                from: 'people',
                let: { team: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$teamId', '$$team']
                                    },
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
                    }
                ],
                as: 'team'
            }
        },
        {
            $project: {
                type: 1,
                name: 1,
                country: 1,
                city: 1,
                weeklyBill: '$team.bill'
            }
        }
    ],
    cursor: {}
};
