db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: "teams",
    pipeline:
        [
            {
                $match:
                    {
                        name: "1. FC Köln"
                    }
            },
            {
                $lookup:
                    {
                        from: "statistics",
                        let:
                            {
                                team_ID: "$_id",
                                teamName: "$name",
                            },
                        pipeline:
                            [
                                {
                                    $match:
                                        {
                                            $expr:
                                                {
                                                    $and:
                                                        [
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$type", "statistic"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$teamId", "$$team_ID"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        { $ifNull: ["$playerId", "Unspecified"] }, "Unspecified"
                                                                    ]
                                                            }
                                                        ]
                                                }
                                        }
                                },
                                {
                                    $project:
                                        {
                                            _id:0,
                                            possession: 1
                                        }
                                }
                            ],
                        as: "stats"
                    }
            },
            {
                $project:
                {
                    name:1,
                    poss: {$avg:"$stats.possession"}
                }
            }
        ],
    cursor:
        {
            batchSize: 50
        }
});
