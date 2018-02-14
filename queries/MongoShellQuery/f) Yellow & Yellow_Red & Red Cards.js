db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'people',
    pipeline:
        [
            {
                $match:
                    {
                        firstName: "Xabier ",
                        lastName: "Alonso Olana"
                    }
            },
            {
                $lookup:
                    {
                        from: "statistics",
                        let: { playerId: "$_id", lastName: "$lastName", firstName: "$firstName" },
                        pipeline:
                            [
                                {
                                    $match:
                                        {
                                            $expr:
                                                {
                                                    $eq:
                                                        [
                                                            "$playerId", "$$playerId"
                                                        ]
                                                }
                                        }
                                },
                                {
                                    $project:
                                        {
                                            "playerId": "$$playerId",
                                            "lastName": "$$lastName",
                                            "firstName": "$$firstName",
                                            "eventType": "$eventType"
                                        }
                                }
                            ],
                        as: "Cards"
                    }
            },
            {
                $unwind: "$Cards"
            },
            { $replaceRoot: { newRoot: "$Cards" } },
            {
                $match:
                    {
                        eventType: { $regex: /Card$/, $options: 'i' } // i --> ignores casesensitivity
                    }
            },
            {
                $group: {
                    _id: { firstName: "$firstName", lastName: "$lastName", Cards: "$eventType"}, count: {$sum: 1}
                }
            }
        ],
    cursor:
        {
            batchSize: 50
        }
})
