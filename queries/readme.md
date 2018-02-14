### ✔ a) Average attendance - club (last season) (8.66 ms)

```json
[
    {
        "_id": "5a7833cbafe5871e2059ca88",
        "type": "Club",
        "name": "1. FC Köln",
        "country": "Germany",
        "city": "Köln",
        "games": [
            {
                "_id": "5a7833cbafe5871e2059ca87",
                "count": 20,
                "competition": [
                    {
                        "_id": "5a7833cbafe5871e2059ca87",
                        "type": "Club",
                        "format": "Domestic League",
                        "name": "Bundesliga",
                        "season": "2017/2018",
                        "country": "Germany",
                        "startDate": "2017-08-18T00:00:00.000Z",
                        "endDate": "2018-05-29T00:00:00.000Z"
                    }
                ]
            },
            {
                "_id": "5a7833cbafe5871e2059ca86",
                "count": 34,
                "competition": [
                    {
                        "_id": "5a7833cbafe5871e2059ca86",
                        "type": "Club",
                        "format": "Domestic League",
                        "name": "Bundesliga",
                        "season": "2016/2017",
                        "country": "Germany",
                        "startDate": "2016-08-14T00:00:00.000Z",
                        "endDate": "2017-05-29T00:00:00.000Z"
                    }
                ]
            }
        ]
    }
]
```

### ✔ b) Clean sheet - club (current season) (965 ms)

```json
[
    {
        "_id": "1. FC Köln",
        "count": 6
    }
]
```

### ✔ c) Player Name, Player Age, Market value, Current club – player (each year) (20 ms)

```json
[
    {
        "firstName": "Thomas",
        "lastName": "Müller",
        "marketValues": [
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 89000000,
                "date": "2018-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 87000000,
                "date": "2017-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 84000000,
                "date": "2016-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 85000000,
                "date": "2015-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 87000000,
                "date": "2014-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 88000000,
                "date": "2013-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 88000000,
                "date": "2012-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 88000000,
                "date": "2011-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 89000000,
                "date": "2010-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 89000000,
                "date": "2009-01-01T00:00:00.000Z"
            },
            {
                "type": "marketvalue",
                "playerId": "5a7833d5afe5871e2059cc32",
                "value": 90000000,
                "date": "2008-01-01T00:00:00.000Z"
            }
        ],
        "contracts": [
            {
                "playerId": "5a7833d5afe5871e2059cc32",
                "type": "contract",
                "contractType": "player",
                "teamId": "5a7833cbafe5871e2059ca8b",
                "salary": 42000000,
                "startDate": "2008-07-01T00:00:00.000Z",
                "endDate": "2019-01-07T00:00:00.000Z",
                "team": [
                    {
                        "_id": "5a7833cbafe5871e2059ca8b",
                        "type": "Club",
                        "name": "FC Bayern München",
                        "country": "Germany",
                        "city": "München"
                    }
                ]
            }
        ],
        "age": 28
    }
]
```

### ✔ d) Weekly wage bill – club (9.18 ms)

```json
[
    {
        "_id": "5a7833cbafe5871e2059ca88",
        "type": "Club",
        "name": "1. FC Köln",
        "country": "Germany",
        "city": "Köln",
        "weeklyBill": [25288443]
    }
]
```

### ✔ e) Manager of the month award – manager (16 ms)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cad4",
        "firstName": "Watson",
        "lastName": "Eichmann",
        "awards": 2
    }
]
```

### ✔ f) Yellow / red yellow / red cards – player (till date) (53 ms)

```json
[
    {
        "_id": {
            "firstName": "Xabier ",
            "lastName": "Alonso Olana",
            "Cards": "Yellow Red Card"
        },
        "count": 1
    },
    {
        "_id": {
            "firstName": "Xabier ",
            "lastName": "Alonso Olana",
            "Cards": "Yellow Card"
        },
        "count": 12
    }
]
```

### ✔ g) Stats – club (last five matches) (235 ms)

```json
[
    {
        "_id": "5a7833d9afe5871e205a7805",
        "startDate": "2018-01-27T14:30:00.000Z",
        "game_id": "5a7833d9afe5871e205a7805",
        "relevantTeam": "5a7833cbafe5871e2059ca88",
        "homeTeam": "5a7833cbafe5871e2059ca88",
        "awayTeam": "5a7833cbafe5871e2059ca8a",
        "gameStat": [
            {
                "_id": "5a7833d9afe5871e205a9a5e",
                "type": "statistic",
                "gameId": "5a7833d9afe5871e205a7805",
                "teamId": "5a7833cbafe5871e2059ca88",
                "possession": 45,
                "shots": 12,
                "shotsOnGoal": 6,
                "crosses": 17,
                "tacklesWon": 8,
                "interceptions": 29,
                "fouls": 14,
                "fouled": 18,
                "offsides": 1,
                "passes": 514,
                "passesCompleted": 402,
                "blockedShots": 1,
                "touches": 712
            }
        ]
    },
    {
        "_id": "5a7833d9afe5871e205a77ff",
        "startDate": "2018-01-20T17:30:00.000Z",
        "game_id": "5a7833d9afe5871e205a77ff",
        "relevantTeam": "5a7833cbafe5871e2059ca88",
        "homeTeam": "5a7833cbafe5871e2059ca8d",
        "awayTeam": "5a7833cbafe5871e2059ca88",
        "gameStat": [
            {
                "_id": "5a7833d9afe5871e205a9979",
                "type": "statistic",
                "gameId": "5a7833d9afe5871e205a77ff",
                "teamId": "5a7833cbafe5871e2059ca88",
                "possession": 58,
                "shots": 10,
                "shotsOnGoal": 2,
                "crosses": 12,
                "tacklesWon": 11,
                "interceptions": 26,
                "fouls": 16,
                "fouled": 24,
                "offsides": 2,
                "passes": 388,
                "passesCompleted": 266,
                "blockedShots": 2,
                "touches": 647
            }
        ]
    },
    {
        "_id": "5a7833d9afe5871e205a77f3",
        "startDate": "2018-01-14T14:30:00.000Z",
        "game_id": "5a7833d9afe5871e205a77f3",
        "relevantTeam": "5a7833cbafe5871e2059ca88",
        "homeTeam": "5a7833cbafe5871e2059ca88",
        "awayTeam": "5a7833cbafe5871e2059ca89",
        "gameStat": [
            {
                "_id": "5a7833d9afe5871e205a97af",
                "type": "statistic",
                "gameId": "5a7833d9afe5871e205a77f3",
                "teamId": "5a7833cbafe5871e2059ca88",
                "possession": 30,
                "shots": 12,
                "shotsOnGoal": 3,
                "crosses": 20,
                "tacklesWon": 12,
                "interceptions": 27,
                "fouls": 20,
                "fouled": 16,
                "offsides": 2,
                "passes": 418,
                "passesCompleted": 307,
                "blockedShots": 2,
                "touches": 622
            }
        ]
    },
    {
        "_id": "5a7833d9afe5871e205a77e5",
        "startDate": "2017-12-16T14:30:00.000Z",
        "game_id": "5a7833d9afe5871e205a77e5",
        "relevantTeam": "5a7833cbafe5871e2059ca88",
        "homeTeam": "5a7833cbafe5871e2059ca88",
        "awayTeam": "5a7833cbafe5871e2059ca9b",
        "gameStat": [
            {
                "_id": "5a7833d9afe5871e205a9596",
                "type": "statistic",
                "gameId": "5a7833d9afe5871e205a77e5",
                "teamId": "5a7833cbafe5871e2059ca88",
                "possession": 38,
                "shots": 20,
                "shotsOnGoal": 8,
                "crosses": 17,
                "tacklesWon": 21,
                "interceptions": 15,
                "fouls": 9,
                "fouled": 15,
                "offsides": 2,
                "passes": 424,
                "passesCompleted": 337,
                "blockedShots": 3,
                "touches": 628
            }
        ]
    },
    {
        "_id": "5a7833d9afe5871e205a77df",
        "startDate": "2017-12-13T19:30:00.000Z",
        "game_id": "5a7833d9afe5871e205a77df",
        "relevantTeam": "5a7833cbafe5871e2059ca88",
        "homeTeam": "5a7833cbafe5871e2059ca8b",
        "awayTeam": "5a7833cbafe5871e2059ca88",
        "gameStat": [
            {
                "_id": "5a7833d9afe5871e205a94af",
                "type": "statistic",
                "gameId": "5a7833d9afe5871e205a77df",
                "teamId": "5a7833cbafe5871e2059ca88",
                "possession": 51,
                "shots": 8,
                "shotsOnGoal": 1,
                "crosses": 5,
                "tacklesWon": 17,
                "interceptions": 23,
                "fouls": 15,
                "fouled": 9,
                "offsides": 0,
                "passes": 196,
                "passesCompleted": 118,
                "blockedShots": 2,
                "touches": 413
            }
        ]
    }
]
```

### ✔ h) Most assists – player (till date) (16 ms)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cc32",
        "count": 21,
        "Player": [
            {
                "_id": "5a7833d5afe5871e2059cc32",
                "type": "person",
                "firstName": "Thomas",
                "lastName": "Müller",
                "nationality": "Germany",
                "dateOfBirth": "1989-09-13T00:00:00.000Z"
            }
        ]
    }
]
```

### ✔ i) Average possession kept – clubs (49 ms)

```json
[
    {
        "_id": "5a7833cbafe5871e2059ca88",
        "name": "1. FC Köln",
        "poss": 50.01136363636363
    }
]
```

### ✔ j) Number of minutes played – player (till date) (52 ms)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cc89",
        "firstName": "Lewis",
        "lastName": "Holtby",
        "dateOfBirth": "1990-09-18T00:00:00.000Z",
        "minutes": 6553
    }
]
```

### ✔ k) Man of the match – player (till date) (13 ms)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cc32",
        "firstName": "Thomas",
        "lastName": "Müller",
        "awardsWon": 5
    }
]
```

### ✔ l) All positions played – player (season possibility check) (1.55 s)

```json
[
    {
        "_id": {
            "player": "5a7833d5afe5871e2059cc39",
            "firstName": "Mehdi Amine",
            "lastName": "El Mouttaqi Benatia",
            "position": "Left Back"
        }
    },
    {
        "_id": {
            "player": "5a7833d5afe5871e2059cc39",
            "firstName": "Mehdi Amine",
            "lastName": "El Mouttaqi Benatia",
            "position": "Right Wing Back"
        }
    },
    {
        "_id": {
            "player": "5a7833d5afe5871e2059cc39",
            "firstName": "Mehdi Amine",
            "lastName": "El Mouttaqi Benatia",
            "position": "Centre Back"
        }
    },
    {
        "_id": {
            "player": "5a7833d5afe5871e2059cc39",
            "firstName": "Mehdi Amine",
            "lastName": "El Mouttaqi Benatia",
            "position": "Right Back"
        }
    },
    {
        "_id": {
            "player": "5a7833d5afe5871e2059cc39",
            "firstName": "Mehdi Amine",
            "lastName": "El Mouttaqi Benatia",
            "position": "Left Wing Back"
        }
    }
]
```

### ✔ m) Football-agent maximum number of represented player – Football-agent (given league) (4.51 s)

```json
[
    {
        "_id": "5a7833d5afe5871e2059d042",
        "competition": null,
        "season": "2017/2018",
        "count": 70,
        "Agent": [
            {
                "_id": "5a7833d5afe5871e2059d042",
                "firstName": "Hoyt",
                "lastName": "Simonis",
                "nationality": "Kyrgyz Republic",
                "dateOfBirth": "1969-01-22T10:37:09.531Z"
            }
        ]
    }
]
```

### ✔ n) Best / worst team – club (week --> performance metrics) (456 ms)

```json
[
    {
        "_id": null,
        "best": {
            "_id": "5a7833cbafe5871e2059ca94",
            "Team": ["BV Borussia 09 Dortmund"],
            "Country": ["Germany"],
            "Goals": 0,
            "PenaltyGoals": 0,
            "OwnGoals": 0,
            "AveragePossession": 56,
            "shotsOnGoal": 3,
            "games": 1,
            "passes": 979,
            "passesCompleted": 890,
            "blockedShots": 14,
            "score": 31.70909090909091
        },
        "worst": {
            "_id": "5a7833cbafe5871e2059ca89",
            "Team": ["Borussia Mönchengladbach"],
            "Country": ["Germany"],
            "Goals": 0,
            "PenaltyGoals": 0,
            "OwnGoals": 0,
            "AveragePossession": 31,
            "shotsOnGoal": 3,
            "games": 1,
            "passes": 630,
            "passesCompleted": 530,
            "blockedShots": 3,
            "score": 13.14126984126984
        }
    }
]
```

### ✔ o) Signing a striker for the best fitting - club (all stats) (3 s)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cdd3",
        "FirstName": ["Luka"],
        "LastName": ["Jović"],
        "shots": 1,
        "shotsOnGoal": 1,
        "tacklesWon": 0,
        "offsides": 1,
        "touches": 15,
        "minutes": 9,
        "games": 1,
        "goals": 1,
        "penaltyGoals": 0,
        "minutespergoal": 9,
        "minutespergame": 9,
        "score": 4
    },
    {
        "_id": "5a7833d5afe5871e2059cedf",
        "FirstName": ["Nils"],
        "LastName": ["Petersen"],
        "shots": 3,
        "shotsOnGoal": 2,
        "tacklesWon": 1,
        "offsides": 0,
        "touches": 56,
        "minutes": 101,
        "games": 1,
        "goals": 2,
        "penaltyGoals": 0,
        "minutespergoal": 50.5,
        "minutespergame": 101,
        "score": 3.6666666666666665
    },
    {
        "_id": "5a7833d5afe5871e2059cd2f",
        "FirstName": ["Mark"],
        "LastName": ["Uth"],
        "shots": 2,
        "shotsOnGoal": 1,
        "tacklesWon": 0,
        "offsides": 1,
        "touches": 26,
        "minutes": 101,
        "games": 1,
        "goals": 1,
        "penaltyGoals": 0,
        "minutespergoal": 101,
        "minutespergame": 101,
        "score": 3.5
    },
    {
        "_id": "5a7833d5afe5871e2059cbd9",
        "FirstName": ["Shinji"],
        "LastName": ["Kagawa"],
        "shots": 2,
        "shotsOnGoal": 1,
        "tacklesWon": 2,
        "offsides": 1,
        "touches": 73,
        "minutes": 101,
        "games": 1,
        "goals": 1,
        "penaltyGoals": 0,
        "minutespergoal": 101,
        "minutespergame": 101,
        "score": 3.5
    },
    {
        "_id": "5a7833d5afe5871e2059cde2",
        "FirstName": ["Armindo"],
        "LastName": ["Tué Na Bangna"],
        "shots": 1,
        "shotsOnGoal": 1,
        "tacklesWon": 3,
        "offsides": 0,
        "touches": 69,
        "minutes": 91,
        "games": 1,
        "goals": 1,
        "penaltyGoals": 0,
        "minutespergoal": 91,
        "minutespergame": 91,
        "score": 3
    }
]
```

### ✔ uc 1) Most goals from a striker (3.51 s)

```json
[
    {
        "_id": "5a7833d8afe5871e205a751d",
        "goals": 2,
        "player": [
            {
                "firstName": "Pierre-Emerick Emiliano François",
                "lastName": "Aubameyang",
                "nationality": "Gabon"
            }
        ]
    }
]
```

### ✔ uc 2) Top 5 fouling player (38 ms)

```json
[
    {
        "games": 15,
        "fouls": 4.714285714285714,
        "player": [
            {
                "_id": "5a7833d5afe5871e2059cf6f",
                "firstName": "Ishak Lazreg Cherif",
                "lastName": "Belfodil",
                "nationality": "Algeria",
                "dateOfBirth": "1992-01-15T00:00:00.000Z"
            }
        ]
    },
    {
        "games": 8,
        "fouls": 4.690553745928339,
        "player": [
            {
                "_id": "5a7833d5afe5871e2059cb78",
                "firstName": "Emil",
                "lastName": "Berggreen",
                "nationality": "Denmark",
                "dateOfBirth": "1993-05-10T00:00:00.000Z"
            }
        ]
    },
    {
        "games": 6,
        "fouls": 4.565217391304348,
        "player": [
            {
                "_id": "5a7833d5afe5871e2059cecd",
                "firstName": "Karim",
                "lastName": "Guédé",
                "nationality": "Slovakia",
                "dateOfBirth": "1985-01-07T00:00:00.000Z"
            }
        ]
    },
    {
        "games": 8,
        "fouls": 4.5,
        "player": [
            {
                "_id": "5a7833d5afe5871e2059cd08",
                "firstName": "Lukas",
                "lastName": "Fröde",
                "nationality": "Germany",
                "dateOfBirth": "1995-01-23T00:00:00.000Z"
            }
        ]
    },
    {
        "games": 7,
        "fouls": 3.7380191693290734,
        "player": [
            {
                "_id": "5a7833d5afe5871e2059cc9c",
                "firstName": "Nabil",
                "lastName": "Bahoui",
                "nationality": "Sweden",
                "dateOfBirth": "1991-02-05T00:00:00.000Z"
            }
        ]
    }
]
```

### ✔ uc 3) Club statistics (113 ms)

```json
[
    {
        "_id": "5a7833cbafe5871e2059ca8b",
        "type": "Club",
        "name": "FC Bayern München",
        "country": "Germany",
        "city": "München",
        "players": 33,
        "games": 88,
        "possession": 51.36363636363637,
        "shots": 20.943181818181817,
        "shotsOnGoal": 8.272727272727273,
        "crosses": 22.818181818181817,
        "tacklesWon": 14.204545454545455,
        "interceptions": 18.193181818181817,
        "fouls": 12.511363636363637,
        "fouled": 13.852272727272727,
        "offsides": 3.227272727272727,
        "passes": 790.6818181818181,
        "passesCompleted": 692.8181818181819,
        "blockedShots": 4.5,
        "touches": 603.5227272727273,
        "events": {
            "substitutions": 258,
            "goals": 207,
            "penaltyGoals": 9,
            "yellowCards": 119,
            "yellowRedCards": 2,
            "redCards": 0
        }
    }
]
```

### ✔ uc 4) Player information (116 ms)

```json
[
    {
        "_id": "5a7833d5afe5871e2059cc32",
        "firstName": "Thomas",
        "lastName": "Müller",
        "nationality": "Germany",
        "dateOfBirth": "1989-09-13T00:00:00.000Z",
        "currentContract": [
            {
                "club": ["FC Bayern München"],
                "country": ["Germany"],
                "city": ["München"],
                "salary": 42000000
            }
        ],
        "yellowCards": 7,
        "yellowRedCards": 0,
        "redCards": 0,
        "goals": 29,
        "totalGames": 76
    }
]
```

### ✔ uc 5) Top 10 yellow cards (111 ms)

```json
[
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca95",
            "team": ["Eintracht Frankfurt"],
            "eventType": "Yellow Card"
        },
        "count": 227
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca8d",
            "team": ["Hamburger SV"],
            "eventType": "Yellow Card"
        },
        "count": 186
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca8a",
            "team": ["FC Augsburg"],
            "eventType": "Yellow Card"
        },
        "count": 186
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca90",
            "team": ["SV Werder Bremen"],
            "eventType": "Yellow Card"
        },
        "count": 177
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca8c",
            "team": ["FC Schalke 04"],
            "eventType": "Yellow Card"
        },
        "count": 177
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca88",
            "team": ["1. FC Köln"],
            "eventType": "Yellow Card"
        },
        "count": 169
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca91",
            "team": ["TSG 1899 Hoffenheim"],
            "eventType": "Yellow Card"
        },
        "count": 168
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca98",
            "team": ["Hertha BSC"],
            "eventType": "Yellow Card"
        },
        "count": 167
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca92",
            "team": ["1. FSV Mainz 05"],
            "eventType": "Yellow Card"
        },
        "count": 161
    },
    {
        "_id": {
            "teamId": "5a7833cbafe5871e2059ca99",
            "team": ["SV Darmstadt 98"],
            "eventType": "Yellow Card"
        },
        "count": 159
    }
]
```
