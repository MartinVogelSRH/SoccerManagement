db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'competitions',
    pipeline: [
        {
            $match:
                {
                    name: "Bundesliga",
                    season: "2016/2017"
                }
        },
        {
            $lookup:
                {
                    from: "games",
                    let: { competition: "$_id" },
                    pipeline:
                        [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $eq: ["$competitionId", "$$competition"]
                                            }
                                    }
                            },
                            {
                                $sort: { startDate: -1 }
                            },
                            {
                                $limit: 10
                            }
                        ],
                    as: "games"
                }
        },
        {
            $unwind: "$games"
        },
        { $replaceRoot: { newRoot: "$games" } },
        {
            $lookup:
                {
                    from: "statistics",
                    let: { origGame: "$_id" },
                    pipeline:
                        [
                            {
                                $match:
                                    {
                                        $expr:
                                            {
                                                $and:
                                                    [
                                                        { $eq: ["$gameId", "$$origGame"] },
                                                        { $eq: ["$type", "statistic"] },
                                                        {
                                                            $in: ["$position", [
                                                                'Centre Forward', 'Withdrawn Striker'
                                                            ]]
                                                        }
                                                    ]
                                            }
                                    }
                            },
                            {
                                $lookup:
                                    {
                                        from: 'statistics',
                                        let: { origGame: "$$origGame", playerId: "$playerId" },
                                        pipeline:
                                            [
                                                {
                                                    $match:
                                                        {
                                                            $expr:
                                                                {
                                                                    $and:
                                                                        [
                                                                            { $eq: ["$gameId", "$$origGame"] },
                                                                            { $eq: ["$type", "event"] },
                                                                            { $eq: ["$playerId", "$$playerId"] },
                                                                            { $in: ["$eventType", ['Goal', 'Penalty Goal']] }
                                                                        ]
                                                                }
                                                        }
                                                }
                                            ],
                                        as: "Goals"
                                    }
                            },
                            {
                                $project:
                                    {
                                        _id: 1,
                                        playerId: 1,
                                        goals:
                                            {
                                                $size: "$Goals"
                                            }
                                    }
                            }
                        ],
                    as: "playerStats"
                }
        },
        {
            $unwind: "$playerStats"
        },
        { $replaceRoot: { newRoot: "$playerStats" } },
        {
            $sort: { goals: -1 }
        },
        {
            $limit: 1
        },
        {
            $lookup:
            {
                from:"people",
                foreignField:"_id",
                localField:"playerId",
                as:"player"
            }
        },
        {
            $project:
            {
                "player.firstName":1,
                "player.lastName":1,
                "player.nationality":1,
                goals:1
            }
        }
    ],
    cursor: {
        batchSize: 200,
    },
})