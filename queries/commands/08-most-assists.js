'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                eventType: 'Goal',
                additionalPlayerId: {
                    $exists: true
                }
            }
        },
        {
            $sortByCount: '$additionalPlayerId'
        },
        {
            $limit: 1
        },
        {
            $lookup: {
                from: 'people',
                localField: '_id',
                foreignField: '_id',
                as: 'Player'
            }
        }
    ],
    cursor: {}
};
