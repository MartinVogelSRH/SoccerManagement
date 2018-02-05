'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                type: 'statistic',
                started: true
            }
        },
        {
            $group: {
                _id: '$playerId',
                fouls: { $sum: '$fouls' },
                games: { $sum: 1 }
            }
        },
        {
            $project: {
                playerId: '$_id',
                fouls: { $divide: ['$fouls', '$games'] }
            }
        },
        {
            $sort: { fouls: -1 }
        },
        { $limit: 5 },
        {
            $lookup: {
                from: 'people',
                localField: 'playerId',
                foreignField: '_id',
                as: 'player'
            }
        },
        {
            $project: {
                _id: 0,
                playerId: 0,
                'player._id': 0,
                'player.type': 0
            }
        }
    ],
    cursor: {
        batchSize: 50
    }
};
