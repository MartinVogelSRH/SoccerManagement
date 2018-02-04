'use strict';

const { ObjectId } = require('./utils');

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                _id: ObjectId('5a75d1d62d70092d98535c9b'),
                firstName: 'Albin',
                lastName: 'Neubauer',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: {
                    manager: '$_id',
                    firstName: '$firstName',
                    lastName: '$lastName',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$managerId', '$$manager'],
                                    },
                                    {
                                        $eq: [
                                            '$awardType',
                                            'managerOfTheMonthAward',
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            manager: '$$manager',
                            lastName: '$$lastName',
                            firstName: '$$firstName',
                        },
                    },
                ],
                as: 'mAward',
            },
        },
        {
            $project: {
                _id: 1,
                manager: 1,
                lastName: 1,
                firstName: 1,
                awards: { $size: '$mAward' },
            },
        },
    ],
    cursor: {
        batchSize: 10,
    },
};
