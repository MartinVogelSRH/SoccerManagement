'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const config = require('config');
const moment = require('moment');
const Promise = require('bluebird');

const ora = require('ora');
const dbs = {
    fantasy: monk(config.get('databases.fantasy')),
    football: monk(config.get('databases.football')),
    close: () => Promise.all([dbs.fantasy.close(), dbs.football.close()]),
};

const fantasyStatKeys = [
    'Shots',
    'ShotsOnGoal',
    'Crosses',
    'TacklesWon',
    'Interceptions',
    'Fouls',
    'Fouled',
    'Offsides',
    'Passes',
    'PassesCompleted',
    'BlockedShots',
    'Touches',
];
const parser = {
    date: date => moment.utc(_.replace(date, /T.*$/, '')).toDate(),
    datetime: datetime => moment.utc(_.replace(datetime, /Z?$/, 'Z')).toDate(),
    stats: fantasyStats =>
        _.reduce(
            fantasyStatKeys,
            (stat, key) => {
                if (_.isNil(fantasyStats[key]) === false) {
                    stat[_.lowerFirst(key)] = _.round(fantasyStats[key]);
                }
                return stat;
            },
            {}
        ),
};

const SeasonCache = {
    cache: {},
    get: SeasonId => SeasonCache.cache[SeasonId],
    set: (SeasonId, _id) => {
        SeasonCache.cache[SeasonId] = _id;
        return _id;
    },
};
const RoundCache = {
    cache: {},
    get: RoundId => RoundCache.cache[RoundId],
    set: (RoundId, _id) => {
        RoundCache.cache[RoundId] = _id;
        return _id;
    },
};

const CompetitionsConverter = Competitions => {
    const SeasonIds = [];
    const RoundIds = [];

    const competitions = _.flatMap(Competitions, Competition => {
        const name = Competition.Name;
        const type = Competition.Type;
        const format = Competition.Format;
        return _.chain(Competition.Seasons)
            .reject(({ Rounds }) => _.isEmpty(Rounds))
            .map(Season => {
                const _id = monk.id();

                SeasonIds.push(Season.SeasonId);
                SeasonCache.set(Season.SeasonId, _id);
                _.forEach(Season.Rounds, ({ RoundId }) => {
                    RoundIds.push(RoundId);
                    RoundCache.set(RoundId, _id);
                });

                const competition = { _id, type, format, name };

                competition.season = Season.Name;
                competition.country = Competition.AreaName;

                competition.startDate = parser.date(Season.StartDate);
                competition.endDate = parser.date(Season.EndDate);

                competition.fantasy = Season;
                return competition;
            })
            .value();
    });

    if (_.isEmpty(competitions)) {
        return null;
    }

    return dbs.football
        .get('competitions')
        .insert(competitions)
        .then(() => ({ RoundIds, SeasonIds }));
};

const TeamCache = {
    cache: {},
    get: TeamId => TeamCache.cache[TeamId],
    set: (TeamId, _id) => {
        TeamCache.cache[TeamId] = _id;
        return _id;
    },
};
const TeamsConverter = Teams => {
    const teams = _.map(Teams, Team => {
        const _id = monk.id();
        TeamCache.set(Team.TeamId, _id);

        const team = { _id };

        team.type = Team.Type;
        team.name = Team.Name;
        team.country = Team.AreaName;

        if (team.type === 'Club') {
            team.city = Team.City;
        }

        team.fantasy = Team;
        return team;
    });

    if (_.isEmpty(teams)) {
        return [];
    }

    return dbs.football.get('teams').insert(teams);
};

const PlayerCache = {
    cache: {},
    get: PlayerId => PlayerCache.cache[PlayerId],
    set: (PlayerId, _id) => {
        PlayerCache.cache[PlayerId] = _id;
        return _id;
    },
};
const PlayersConverter = Players => {
    const type = 'person';
    const players = _.map(Players, Player => {
        const _id = monk.id();
        PlayerCache.set(Player.PlayerId, _id);

        const player = { _id, type };

        // NOTE: There was one player without a first name so just to be sure
        player.firstName =
            Player.FirstName || _.split(Player.CommonName, ' ')[0];
        player.lastName = Player.LastName;

        player.nationality = Player.Nationality;
        player.dateOfBirth = parser.date(Player.BirthDate);

        return player;
    });

    if (_.isEmpty(players)) {
        return null;
    }

    return dbs.football.get('people').insert(players);
};

const ContractsConverter = Memberships => {
    const membershipsByPlayer = _.groupBy(Memberships, 'PlayerId');
    const docs = _.flatMap(
        membershipsByPlayer,
        (playerMemberships, PlayerId) => {
            const playerId = PlayerCache.get(PlayerId);

            const dates = {
                start: moment.utc(),
            };

            const contracts = _.map(playerMemberships, fantasy => {
                const contract = { playerId };
                contract.type = 'contract';
                contract.contractType = 'player';
                contract.teamId = TeamCache.get(fantasy.TeamId);
                contract.salary = _.random(1, 70) * 1000000;
                contract.startDate = fantasy.StartDate
                    ? parser.date(fantasy.StartDate)
                    : moment
                          .utc(fantasy.EndDate || fantasy.Updated)
                          .subtract(_.random(1, 5), 'year')
                          .dayOfYear(_.random(1, 365))
                          .startOf('day')
                          .toDate();

                if (fantasy.Active === false) {
                    contract.endDate = fantasy.EndDate
                        ? parser.date(fantasy.EndDate)
                        : moment
                              .utc(contract.startDate)
                              .add(_.random(1, 5), 'year')
                              .dayOfYear(_.random(1, 365))
                              .startOf('day')
                              .toDate();
                }

                if (fantasy.Active) {
                    dates.end = moment.utc();
                } else if (!dates.end || dates.end.isBefore(contract.endDate)) {
                    dates.end = moment.utc(contract.endDate);
                }

                return contract;
            });

            let last = _.random(10, 100);
            const diff = dates.end.year() - dates.start.year();
            const marketvalues = _.times(diff + 1, i => {
                const type = 'marketvalue';
                last = _.random(last - _.random(2), last + _.random(3));
                const value = last * 1000000;
                const date = moment
                    .utc(dates.start)
                    .startOf('year')
                    .add(i, 'year')
                    .toDate();
                return { type, playerId, value, date };
            });

            return _.concat(contracts, marketvalues);
        }
    );

    if (_.isEmpty(docs)) {
        return null;
    }

    return dbs.football.get('people').insert(docs);
};

const GamesConverter = BoxScores => {
    const converters = {
        game: (fantasy, minutes) => {
            const game = {};

            game._id = monk.id();

            game.competitionId = RoundCache.get(fantasy.RoundId);
            game.homeTeamId = TeamCache.get(fantasy.HomeTeamId);
            game.awayTeamId = TeamCache.get(fantasy.AwayTeamId);

            game.gameTime = minutes;
            game.startDate = parser.datetime(fantasy.DateTime);
            game.endDate = moment
                .utc(game.startDate)
                .add(game.gameTime + 15, 'minutes')
                .toDate();

            return game;
        },
        goals: (gameId, Goals) =>
            _.map(Goals, fantasy => {
                const goal = {};

                goal.type = 'event';
                goal.gameId = gameId;
                goal.teamId = TeamCache.get(fantasy.TeamId);
                goal.playerId = PlayerCache.get(fantasy.PlayerId);

                goal.eventType = _.words(fantasy.Type).join(' ') || 'Goal';
                goal.gameMinute = _.toString(fantasy.GameMinute);
                if (fantasy.GameMinuteExtra) {
                    goal.gameMinute += ` +${fantasy.GameMinute}`;
                }

                if (fantasy.AssistedByPlayerId1) {
                    goal.additionalPlayerId = PlayerCache.get(
                        fantasy.AssistedByPlayerId1
                    );
                }

                goal.fantasy = fantasy;
                return goal;
            }),
        cards: (gameId, Bookings) =>
            _.map(Bookings, fantasy => {
                const card = {};

                card.type = 'event';
                card.gameId = gameId;
                card.teamId = TeamCache.get(fantasy.TeamId);
                card.playerId = PlayerCache.get(fantasy.PlayerId);

                card.eventType = fantasy.Type;
                card.gameMinute = _.toString(fantasy.GameMinute);
                if (fantasy.GameMinuteExtra) {
                    card.gameMinute += ` +${fantasy.GameMinute}`;
                }

                card.fantasy = fantasy;
                return card;
            }),
        substitutions: (gameId, Lineups) =>
            _.chain(Lineups)
                .filter(['Type', 'Substitute In'])
                .map(fantasy => {
                    const substitution = {};

                    substitution.type = 'event';
                    substitution.gameId = gameId;
                    substitution.teamId = TeamCache.get(fantasy.TeamId);
                    substitution.playerId = PlayerCache.get(fantasy.PlayerId);
                    substitution.additionalPlayerId = PlayerCache.get(
                        fantasy.ReplacedPlayerId
                    );

                    substitution.eventType = 'Substitution';
                    substitution.gameMinute = _.toString(fantasy.GameMinute);
                    if (fantasy.GameMinuteExtra) {
                        substitution.gameMinute += ` +${fantasy.GameMinute}`;
                    }

                    substitution.fantasy = fantasy;
                    return substitution;
                })
                .value(),
        teamStatistics: (gameId, TeamGames) => {
            const position = _.random(50, 70);
            const possessions = [position, 100 - position];
            return _.map(TeamGames, (fantasy, i) => {
                const statistic = {};
                statistic.type = 'statistic';
                statistic.gameId = gameId;
                statistic.teamId = TeamCache.get(fantasy.TeamId);

                statistic.possession = possessions[i];
                return _.assign(statistic, parser.stats(fantasy));
            });
        },
        playerStatistics: (game, PlayerGames) =>
            _.map(PlayerGames, fantasy => {
                const statistic = {};
                statistic.type = 'statistic';
                statistic.gameId = game._id;
                statistic.teamId = TeamCache.get(fantasy.TeamId);
                statistic.playerId = PlayerCache.get(fantasy.PlayerId);

                statistic.position = fantasy.Position;
                statistic.started = fantasy.Started > 0;
                statistic.minutes = _.round(fantasy.Minutes);
                if (statistic.minutes > game.gameTime) {
                    statistic.minutes = game.gameTime;
                }
                return _.assign(statistic, parser.stats(fantasy));
            }),
        award: (gameId, Game, Lineups) => {
            let winningTeam = Game.HomeTeamId;
            if (Game.AwayTeamScore > Game.HomeTeamScore) {
                winningTeam = Game.AwayTeamId;
            }

            const player = _.chain(Lineups)
                .filter({ TeamId: winningTeam, Type: 'Starter' })
                .sample()
                .value();

            const type = 'award';
            const awardType = 'ManOfTheMatchAward';
            const playerId = PlayerCache.get(player.PlayerId);

            return { type, awardType, gameId, playerId };
        },
    };

    const { games, events, statistics, awards } = _.reduce(
        BoxScores,
        (reduced, BoxScores) => {
            const max = _.maxBy(BoxScores.PlayerGames, 'Minutes');
            let minutes = _.round(max.Minutes);
            if (minutes < 90) {
                minutes = 90;
            }
            const game = converters.game(BoxScores.Game, minutes);
            reduced.games.push(game);

            reduced.events = _.concat(
                reduced.events,
                converters.goals(game._id, BoxScores.Goals),
                converters.cards(game._id, BoxScores.Bookings),
                converters.substitutions(game._id, BoxScores.Lineups)
            );

            reduced.statistics = _.concat(
                reduced.statistics,
                converters.teamStatistics(game._id, BoxScores.TeamGames),
                converters.playerStatistics(game, BoxScores.PlayerGames)
            );

            reduced.awards.push(
                converters.award(game._id, BoxScores.Game, BoxScores.Lineups)
            );

            return reduced;
        },
        {
            games: [],
            events: [],
            statistics: [],
            awards: [],
        }
    );

    return Promise.all([
        dbs.football.get('games').insert(games),
        dbs.football.get('statistics').insert(_.concat(events, statistics)),
        dbs.football.get('people').insert(awards),
    ]);
};

// {
//   competitions: 27,
//   games: 6337,
//   teams: 241,
//   memberships: 24966,
//   players: 12093
// }
const tasks = auto({
    competitions: () => {
        const spinner = ora().start('Load competitions');

        const task = dbs.fantasy
            .get('boxScores')
            .find({ Lineups: [] }, { 'Game.RoundId': 1, _id: 0 })
            .then(BoxScores => _.uniq(_.map(BoxScores, 'Game.RoundId')))
            .then(RoundIds =>
                dbs.fantasy.get('hierarchy').find({
                    $and: [
                        {
                            'Competitions.Seasons.Rounds.RoundId': {
                                $exists: true,
                            },
                        },
                        {
                            'Competitions.Seasons.Rounds.RoundId': {
                                $nin: RoundIds,
                            },
                        },
                    ],
                })
            )
            .then(docs => _.flatMap(docs, 'Competitions'));

        return Promise.resolve(task)
            .tap(r => {
                spinner.text = `Converting ${_.size(r)} competitions`;
            })
            .then(CompetitionsConverter)
            .tap(r =>
                spinner.succeed(`Created ${_.size(r.SeasonIds)} competitions`)
            );
    },
    teams: [
        'competitions',
        results => {
            const SeasonIds = _.get(results, ['competitions', 'SeasonIds']);

            const spinner = ora().start(
                `Loading teams for ${_.size(SeasonIds)} season`
            );

            const task = dbs.fantasy
                .get('seasonTeams')
                .find({ SeasonId: { $in: SeasonIds } });

            return Promise.resolve(task)
                .then(docs => {
                    const Teams = _.uniqBy(_.map(docs, 'Team'), 'TeamId');
                    const TeamIds = _.map(Teams, 'TeamId');

                    spinner.text = `Converting ${_.size(TeamIds)} teams`;
                    return TeamsConverter(Teams)
                        .then(() => {
                            const grouped = _.chain(docs)
                                .groupBy(({ SeasonId }) =>
                                    SeasonCache.get(SeasonId)
                                )
                                .mapValues(group =>
                                    _.map(group, ({ TeamId }) =>
                                        TeamCache.get(TeamId)
                                    )
                                )
                                .value();

                            return Promise.map(
                                _.keys(grouped),
                                competitionId => {
                                    const teams = grouped[competitionId];
                                    return dbs.football
                                        .get('competitions')
                                        .update(
                                            { _id: competitionId },
                                            { $set: { teams } }
                                        );
                                }
                            );
                        })
                        .then(() => TeamIds);
                })
                .tap(r => spinner.succeed(`Created ${_.size(r)} teams`));
        },
    ],
    memberships: [
        'teams',
        ({ teams }) =>
            dbs.fantasy.get('memberships').find({ TeamId: { $in: teams } }),
    ],
    players: [
        'memberships',
        ({ memberships }) => {
            const PlayerIds = _.uniq(_.map(memberships, 'PlayerId'));

            const spinner = ora().start(
                `Coverting ${_.size(PlayerIds)} players`
            );

            const task = dbs.fantasy
                .get('players')
                .find({ PlayerId: { $in: PlayerIds } })
                .then(PlayersConverter);

            return Promise.resolve(task).tap(r =>
                spinner.succeed(`Created ${_.size(r)} players`)
            );
        },
    ],
    contracts: [
        'memberships',
        'players',
        ({ memberships }) => ContractsConverter(memberships),
    ],
    games: [
        'competitions',
        'players',
        results => {
            const RoundIds = _.get(results, ['competitions', 'RoundIds']);

            return Promise.mapSeries(RoundIds, RoundId => {
                const spinner = ora().start(
                    `Loading games for round ${RoundId}`
                );
                const task = dbs.fantasy
                    .get('boxScores')
                    .find({ 'Game.RoundId': RoundId });
                return Promise.resolve(task)
                    .tap(r => {
                        spinner.text = `Converting ${_.size(r)} games`;
                    })
                    .then(GamesConverter)
                    .tap(r => spinner.succeed(`Created ${_.size(r[0])} games`));
            });
        },
    ],
});

Promise.resolve(tasks)
    .catch(console.error)
    .then(dbs.close);
