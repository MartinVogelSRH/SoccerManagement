db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'teams',
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
                        from: "games",
                        let: { team: "$_id", name: "$name" },
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
                                                                $or:
                                                                    [
                                                                        {
                                                                            $eq:
                                                                                [
                                                                                    "$awayTeamId", "$$team"
                                                                                ]
                                                                        },
                                                                        {
                                                                            $eq:
                                                                                [
                                                                                    "$homeTeamId", "$$team"
                                                                                ]
                                                                        }
                                                                    ]
                                                            },
                                                            {
                                                                $gte:
                                                                    [
                                                                        "$startDate", ISODate("2016-08-01 00:00:00.000")
                                                                    ]
                                                            },
                                                            {
                                                                $lte:
                                                                    [
                                                                        "$startDate", ISODate("2018-08-01 00:00:00.000")
                                                                    ]
                                                            }
                                                        ]
                                                }
                                        }
                                },
                                {
                                    $group: { _id: "$competitionId", count: { $sum: 1 } }
                                },
                                {
                                    $lookup:
                                        {
                                            from: "competitions",
                                            localField: "_id",
                                            foreignField: "_id",
                                            as: "competition"
                                        }
                                },
                                {
                                    $project:
                                        {
                                            "competition.teams": 0
                                        }
                                }
                            ],
                        as: "games"
                    }
            }
        ],
    cursor:
        {
            batchSize: 50
        }
})