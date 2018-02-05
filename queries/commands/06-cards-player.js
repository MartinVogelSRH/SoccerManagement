'use strict';

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                lastName: 'Alonso Olana',
            },
        },
        {
            $lookup: {
                from: 'people',
                localField: 'lastName',
                foreignField: 'lastName',
                as: 'Player',
            },
        },
        {
            $lookup: {
                from: 'statistics',
                let: {
                    playerId: '$_id',
                    lastName: '$lastName',
                    firstName: '$firstName',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ['$playerId', '$$playerId'],
                            },
                        },
                    },
                    {
                        $project: {
                            lastName: '$$lastName',
                            firstName: '$$firstName',
                            eventType: '$eventType',
                        },
                    },
                ],
                as: 'Cards',
            },
        },
        {
            $unwind: '$Cards',
        },
        { $replaceRoot: { newRoot: '$Cards' } },
        {
            $match: {
                eventType: { $regex: /Card$/, $options: 'i' },
            },
        },
        {
            $group: {
                _id: { Player: '$lastName', Cards: '$eventType' },
                count: { $sum: 1 },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
