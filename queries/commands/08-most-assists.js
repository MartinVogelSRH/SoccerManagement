'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                description: 'Goal',
                additionalPlayerId: {
                    $exists: true,
                },
            },
        },
        {
            $sortByCount: '$additionalPlayerId',
        },
        {
            $lookup: {
                from: 'people',
                localField: '_id',
                foreignField: '_id',
                as: 'Player',
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
