'use strict';

const { ObjectId } = require('./utils');

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                playerId: ObjectId('5a71be6dbaca8167df6793e2'),
                description: { $regex: /Card$/, $options: 'i' },
            },
        },
        {
            $lookup: {
                from: 'people',
                localField: 'playerId',
                foreignField: '_id',
                as: 'Player',
            },
        },
        {
            $group: {
                _id: { Player: '$Player', card: '$description' },
                count: { $sum: 1 },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
