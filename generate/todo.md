# Awards

* [x] Man of the match

    ```json
    {
        "_id": "5a75bab767e95240c8aab5de",
        "type": "award",
        "awardType": "ManOfTheMatchAward",
        "playerId": "5a75bab767e95240c8aab5b5",
        "gameId": "5a75bab767e95240c8aab5dc"
    }
    ```

* [ ] Manager of the month

    ```json
    {
        "_id": "5a75bab767e95240c8aab5d8",
        "type": "award",
        "awardType": "ManagerOfTheMonthAward",
        "managerId": "5a75bab767e95240c8aab5c0",
        "month": "2017-10-01T00:00:00.000Z"
    }
    ```

# People

* [ ] Manager (+ contract with team)

    ```json
    {
        "_id": "5a75bab767e95240c8aab5d4",
        "type": "contract",
        "contractType": "manager",
        "clubId": "5a75bab767e95240c8aab5c6",
        "managerId": "5a75bab767e95240c8aab5bf",
        "startDate": "2014-12-31T23:00:00.000Z",
        "endDate": "2016-12-30T23:00:00.000Z"
    }
    ```

* [ ] Agent (+ contract with player)

    ```json
    {
        "_id": "5a75bab767e95240c8aab5d0",
        "type": "contract",
        "contractType": "agent",
        "agentId": "5a75bab767e95240c8aab5b9",
        "playerId": "5a75bab767e95240c8aab5b5",
        "startDate": "2016-12-31T23:00:00.000Z",
        "endDate": "2019-12-30T23:00:00.000Z"
    }
    ```

* [ ] Trainer?

    ```json
    {
        "_id": "5a75bab767e95240c8aab5d1",
        "type": "contract",
        "contractType": "trainer",
        "clubId": "5a75bab767e95240c8aab5c6",
        "trainerId": "5a75bab767e95240c8aab5bc",
        "startDate": "2014-12-31T23:00:00.000Z",
        "endDate": "2016-12-30T23:00:00.000Z"
    }
    ```

* [x] Market Values

    ```json
    {
        "_id": "5a75bab767e95240c8aab5c2",
        "playerId": "5a75bab767e95240c8aab5b5",
        "value": 1500000,
        "date": "2016-12-31T23:00:00.000Z"
    }
    ```

# Team Game Stats

* [x] possession (Ballbesitz)

    ```javascript
    const posA = _.random(40, 70);
    const posB = 100 - posA;
    ```
