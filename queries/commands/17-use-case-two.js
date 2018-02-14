'use strict';

module.exports = {
    aggregate: 'statistics',
    pipeline: [
        {
            $match: {
                type: 'statistic',
                playerId: { $exists: true },
                minutes: { $gt: 0 }
            }
        },
        {
            $group: {
                _id: '$playerId',
                games: { $sum: 1 },
                fouls: { $sum: '$fouls' },
                minutes: { $sum: '$minutes' }
            }
        },
        { $match: { games: { $gte: 5 } } },
        {
            $project: {
                playerId: '$_id',
                games: 1,
                fouls: { $multiply: [{ $divide: ['$fouls', '$minutes'] }, 90] }
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
                // 'player._id': 0,
                'player.type': 0
            }
        }
    ],
    cursor: {}
};
