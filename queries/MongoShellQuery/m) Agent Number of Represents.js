db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'competitions',
    pipeline:
        [
            {
                $match:
                    {
                        name: "Bundesliga"
                    }
            },
            {
                $sort:
                    {
                        "startDate": -1
                    },
            },
            {
                $limit: 1
            },
            { $unwind: "$teams" },
            {
                $lookup:
                    {
                        from: "people",
                        let: { teams: "$teams", competition: "$competition", name: "$name", season: "$season", startDate: "$startDate", endDate: "$endDate" },
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
                                                                        "$contractType", "player"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$teamId", "$$teams"
                                                                    ]
                                                            },
                                                            {
                                                                $gt:
                                                                    [
                                                                        "$endDate", ISODate()
                                                                    ]
                                                            },
                                                        ]
                                                },
                                        }
                                },
                                {
                                    $project:
                                        {
                                            _id: 1,
                                            "competition": "$$competition",
                                            "teamId": "$teamId",
                                            "name": "$$name",
                                            "season": "$$season",
                                            "startDate": "$$startDate",
                                            "endDate": "$$endDate",
                                            "playerId": "$playerId"
                                        }
                                }
                            ],
                        as: "PlayerContracts"
                    }
            },

            { $unwind: "$PlayerContracts" },
            { $replaceRoot: { newRoot: "$PlayerContracts" } },
            {
                $lookup:
                    {
                        from: "people",
                        let: { teams: "$teams", competition: "$competition", name: "$name", season: "$season", startDate: "$startDate", endDate: "$endDate", playerId: "$playerId" },
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
                                                                        "$contractType", "agent"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$playerId", "$$playerId"
                                                                    ]
                                                            },
                                                            {
                                                                $lte:
                                                                    [
                                                                        "$startDate", "$$startDate"
                                                                    ]
                                                            },
                                                            {
                                                                $gte:
                                                                    [
                                                                        "$endDate", "$$startDate"
                                                                    ]
                                                            },
                                                        ]
                                                },
                                        }
                                },
                                {
                                    $project:
                                        {
                                            _id: 1,
                                            "competition": "$$competition",
                                            "teamId": "$teamId",
                                            "name": "$$name",
                                            "season": "$$season",
                                            "startDate": "$$startDate",
                                            "endDate": "$$endDate",
                                            "playerId": "$$playerId",
                                            "agentId": "$agentId"
                                        }
                                }
                            ],
                        as: "AgentContracts"
                    }
            },
            {
                $unwind: "$AgentContracts"
            },
            { $replaceRoot: { newRoot: "$AgentContracts" } },
            {$group: { _id: "$agentId", competition: {$first: "$competition"}, season: {$first:"$season"}, count: { $sum: 1 } }},
            {
            $sort: {"count": -1}
            },
            {
                $limit:1
            },
            {
                $lookup:
                {
                    from:"people",
                    localField:"_id",
                    foreignField:"_id",
                    as:"Agent"
                }
            }
        ],
    cursor:
        {
            batchSize: 50
        }
})