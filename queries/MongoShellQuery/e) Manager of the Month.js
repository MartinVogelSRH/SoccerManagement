db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'people',
    pipeline:
        [
            {
                $match:
                    {
                        firstName: "Watson",
                        lastName: "Eichmann"
                    }
            },
            {
                $lookup:
                    {
                        from: "people",
                        let: { manager: "$_id", firstName: "$firstName", lastName: "$lastName" },
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
                                                                        "$managerId", "$$manager"
                                                                    ]
                                                            },
                                                            {
                                                                $eq:
                                                                    [
                                                                        "$awardType", "ManagerOfTheMonthAward"
                                                                    ]
                                                            }
                                                        ]

                                                }
                                        }
                                },
                                {
                                    $project:
                                        {
                                            _id: 1,
                                            "manager": "$$manager",
                                            "lastName": "$$lastName",
                                            "firstName": "$$firstName"
                                        }
                                }
                            ],
                        as: "mAward"
                    }
            },
            {
                $project:
                    {
                        _id: 1,
                        manager: 1,
                        lastName: 1,
                        firstName: 1,
                        awards: { $size: "$mAward" }
                    }
            },
        ],
    cursor:
        {
            batchSize: 10
        }
})
