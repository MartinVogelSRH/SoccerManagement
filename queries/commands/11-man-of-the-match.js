'use strict';

module.exports = {
    aggregate: 'people',
    pipeline: [
        {
            $match: {
                firstName: 'Max',
                lastName: 'Mustermann',
            },
        },
        {
            $lookup: {
                from: 'people',
                let: {
                    player_ID: '$_id',
                    firstName: '$firstName',
                    lastName: '$lastName',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ['$playerId', '$$player_ID'],
                                    },
                                    {
                                        $eq: [
                                            '$awardType',
                                            'manOfTheMatchAward',
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            player: '$$player_ID',
                            firstName: '$$firstName',
                            lastName: '$$lastName',
                        },
                    },
                ],
                as: 'Awards',
            },
        },
        {
            $project: {
                _id: 1,
                player: 1,
                firstName: 1,
                lastName: 1,
                awardsWon: { $size: '$Awards' },
            },
        },
    ],
    cursor: {
        batchSize: 50,
    },
};
