# Football

## team

```js
{
    type: ['club', 'national'],
    name: 'String',
    country: 'String',
    city: 'String',
}
```

## People

### Person (Player, Manager, Coach)

```js
{
    type: 'person',
    firstName: 'String',
    lastName: 'String',
    nationality: 'String',
    birthday: 'Date',
}
```

### Contract

```js
{
    type: 'contract',
    teamId: 'ObjectId',
    playerId: 'ObjectId',
    startDate: 'Date',
    endDate: 'Date',
    salary: 'Number',
}
```

### Market Value

```js
{
    type: 'marketvalue',
    playerId: 'ObjectId',
    date: 'Date',
    value: 'Number',
}
```

## Award

```js
{
    type: 'award',
    personId: 'ObjectId',
    award: ['Man of the match', 'Manager of the month'],
    date: 'Date',
    competitionId: 'ObjectId',
    gameId: 'ObjectId',
}
```

## Competitions

### Competition

```js
{
    type: ['league', 'tournament'],
    name: 'String',
    season: 'String',
    country: 'String',
    startDate: 'Date',
    endDate: 'Date',
    teamIds: ['ObjectId']
}
```

## Games

### Game

```js
{
    competitionId: 'ObjectId',
    homeTeamId: 'ObjectId',
    awayTeamId: 'ObjectId',
    startDate: 'Date',
    endDate: 'Date',
}
```

## Statistics

### Statistic

```js
{
    type: 'statistic',
    gameId: 'ObjectId',
    teamId: 'ObejctId',
    playerId: 'ObjectId',
    position: ['String'],
    minutes: 'Number',
    // goals: 'Number',
    // assists: 'Number',
    // fouls: 'Number',
    // fouled: 'Number',
    goalAttempts: 'Number',
    offsides: 'Number',
    duels: 'Number',
    passes: 'Number',
    completedPasses: 'Number',
    runningDistance: 'Number',
    sprintDistance: 'Number',
    averageSpeed: 'Number',
}
```

### Event

```js
{
    type: 'event',
    gameId: 'ObjectId',
    teamId: 'ObjectId',
    playerId: 'ObjectId',
    description: ['Goal', 'Penalty Goal', 'Own Goal', 'Yellow Card', 'Yellow Red Card', 'Red Card'],
    gameMinute: 'Number',
}
```
