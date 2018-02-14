db = db.getSiblingDB('bundesliga-database');
db.runCommand({
    aggregate: 'statistics',
    pipeline:
        [
            {
                $match:
                    {
                        eventType: "Yellow Card"
                    }
            },
            {
                $lookup:
                    {
                        from: "teams",
                        localField: "teamId",
                        foreignField: "_id",
                        as: "Team"
                    }
            },
            {
                $group: { _id: { teamId: "$teamId", team:"$Team.name", eventType: "$eventType" }, count: { $sum: 1 } }
            },
            {
                $sort: { "count": -1 }
            },
            {
                $limit:10
            }
        ],
    cursor:
        {
            batchSize: 100
        }
})
