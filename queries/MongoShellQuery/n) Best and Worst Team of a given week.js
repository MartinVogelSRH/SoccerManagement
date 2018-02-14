db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'games',
    pipeline: [
        {
            $match:
                {
                    $expr:
                        {
                            $and:
                                [
                                    { $gte: ["$startDate", ISODate("2017-09-04T00:00:00.166Z")] },
                                    { $lte: ["$endDate", ISODate("2017-09-10T23:59:59.166Z")] }
                                ]
                        }

                }
        },
        {
            $lookup:
                {
                    from: "statistics",
                    let: { gameId: "$_id" },
                    pipeline:
                        [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        { $eq: ["$gameId", "$$gameId"] },
                                                        {
                                                            $or:
                                                                [
                                                                    {
                                                                        $and:
                                                                            [
                                                                                { $eq: ["$type", "statistic"] },
                                                                                { $lte: ["$playerId", null] }
                                                                            ]
                                                                    },
                                                                    { $eq: ["$type", "event"] }
                                                                ]
                                                        }

                                                    ]
                                            }
                                    }
                            }
                        ],
                    as: "gameStats"
                }
        },
        {
            $unwind: "$gameStats"
        },
        { $replaceRoot: { newRoot: "$gameStats" } },
        {
            $group:
                {
                    _id: "$teamId",
                    Goals:
                        {
                            $sum:
                                {
                                    $cond:
                                        [
                                            { $eq: ["$eventType", "Goal"] }, 1, 0
                                        ]
                                }
                        },
                    PenaltyGoals:
                        {
                            $sum:
                                {
                                    $cond:
                                        [
                                            { $eq: ["$eventType", "Penalty Goal"] }, 1, 0
                                        ]
                                }
                        },
                    OwnGoals:
                        {
                            $sum:
                                {
                                    $cond:
                                        [
                                            { $eq: ["$eventType", "Own Goal"] }, 1, 0
                                        ]
                                }
                        },
                    AveragePossession: { $avg: "$possession" },
                    shotsOnGoal: { $sum: "$shotsOnGoal" },

                    games: {
                        $sum:
                            {
                                $cond:
                                    [
                                        { $eq: ["$type", "statistic"] }, 1, 0
                                    ]
                            }
                    },
                    passes: { $sum: '$passes' },
                    passesCompleted: { $sum: '$passesCompleted' },
                    blockedShots: { $sum: '$blockedShots' },
                }
        },
        {
            $lookup:
                {
                    from: "teams",
                    localField: "_id",
                    foreignField: "_id",
                    as: "Team"
                }
        },
        {
            $project:
                {
                    Team: "$Team.name",
                    Country: "$Team.country",
                    Goals: "$Goals",
                    PenaltyGoals: "$PenaltyGoals",
                    OwnGoals: "$OwnGoals",
                    AveragePossession: "$AveragePossession",
                    shotsOnGoal: "$shotsOnGoal",
                    games: "$games",
                    passes: '$passes',
                    passesCompleted: '$passesCompleted',
                    blockedShots: '$blockedShots',
                    score:
                        {
                            $divide:
                                [
                                    {
                                        $sum:
                                            [
                                                "$Goals",
                                                "$blockedShots",
                                                { $multiply: ["$PenaltyGoals", 0.5] },
                                                { $multiply: ["$OwnGoals", -1] },
                                                { $multiply: ["$AveragePossession", 0.3] },
                                                {
                                                    $cond:
                                                        [
                                                            { $gt: ["$Goals", 0] }, { $divide: ["$shotsOnGoal", "$Goals"] }, 0
                                                        ]
                                                },
                                                {
                                                    $cond:
                                                        [
                                                            { $gt: ["$passesCompleted", 0] }, { $divide: ["$passesCompleted", "$passes"] }, 0
                                                        ]
                                                }
                                            ]
                                    }
                                    , "$games"
                                ]
                        }
                }
        },
        {
            $sort: {score: -1 }
        },
        {
            $group: {
                _id: null,
                best: { $first: "$$ROOT" },
                worst: { $last: "$$ROOT" }
              }
        }
    ],
    cursor: {
        batchSize: 200,
    },
})