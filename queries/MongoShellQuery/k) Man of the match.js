db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'people',
    pipeline:
        [
            {
                $match:
                    {
                        firstName: 'Thomas',
                        lastName: 'Müller'
                    }
            },
            {
                $lookup:
                    {
                        from: "people",
                        let: { player_ID: "$_id", firstName: "$firstName", lastName: "$lastName" },
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
                                                                        "$playerId", "$$player_ID"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$awardType", "ManOfTheMatchAward"
                                                                    ]
                                                            },
                                                        ]
                                                }
                                        }
                                },
                                {
                                    $project:
                                        {
                                            _id: 1,
                                            "player": "$$player_ID",
                                            "firstName": "$$firstName",
                                            "lastName": "$$lastName"
                                        }
                                }
                            ],
                        as: "Awards"
                    }
            },
            {
                $project:
                    {
                        _id: 1,
                        player: 1,
                        firstName: 1,
                        lastName: 1,
                        awardsWon: { $size: "$Awards" }
                    }
            }
        ],
    cursor:
        {
            batchSize: 50
        }
})