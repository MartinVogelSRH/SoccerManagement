'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const faker = require('faker');
const config = require('config');
const moment = require('moment');
const Promise = require('bluebird');

const ora = require('ora');

const dbs = {
    fantasy: monk(config.get('databases.fantasy')),
    football: monk(config.get('databases.football')),
    close: () => Promise.all([dbs.fantasy.close(), dbs.football.close()])
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
    'Touches'
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
        )
};

const fakePerson = () => {
    const _id = monk.id();
    const firstName = faker.name.firstName(0);
    const lastName = faker.name.lastName(0);

    const nationality = faker.address.country();
    const dateOfBirth = moment
        .utc()
        .subtract(_.random(40, 60), 'years')
        .dayOfYear(_.random(365))
        .startOf('day')
        .toDate();

    return { _id, firstName, lastName, nationality, dateOfBirth };
};

const SeasonCache = {
    cache: {},
    get: SeasonId => SeasonCache.cache[SeasonId],
    set: (SeasonId, _id) => {
        SeasonCache.cache[SeasonId] = _id;
        return _id;
    }
};
const RoundCache = {
    cache: {},
    get: RoundId => RoundCache.cache[RoundId],
    set: (RoundId, _id) => {
        RoundCache.cache[RoundId] = _id;
        return _id;
    }
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
    }
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
    }
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

    const agentSize = _.size(membershipsByPlayer) / 150;
    const fakeAgents = _.times(agentSize, fakePerson);

    const docs = _.flatMap(
        membershipsByPlayer,
        (playerMemberships, PlayerId) => {
            const playerId = PlayerCache.get(PlayerId);

            const dates = {
                min: moment.utc(),
                max: moment.utc().subtract(100, 'years')
            };
            const playerContracts = _.map(playerMemberships, fantasy => {
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

                contract.endDate = fantasy.EndDate
                    ? parser.date(fantasy.EndDate)
                    : moment
                          .utc(fantasy.Active ? new Date() : contract.startDate)
                          .add(_.random(1, 5), 'year')
                          .dayOfYear(_.random(1, 365))
                          .startOf('day')
                          .toDate();

                if (dates.min.isAfter(contract.startDate)) {
                    dates.min = moment.utc(contract.startDate);
                }

                if (dates.max.isBefore(contract.endDate)) {
                    dates.max = moment.utc(contract.endDate);
                }

                return contract;
            });

            let last = _.random(10, 100);
            const now = moment.utc();
            const max =
                dates.max.year() > now.year() ? now.year() : dates.max.year();
            const years = max - dates.min.year();
            const marketvalues = _.times(years + 1, i => {
                const type = 'marketvalue';

                last = _.random(last - _.random(2), last + _.random(3));
                const value = last * 1000000;
                const date = dates.min
                    .clone()
                    .startOf('year')
                    .add(i, 'years')
                    .toDate();

                return { type, playerId, value, date };
            });

            const agents = _.sampleSize(fakeAgents, _.random(1, 2));

            const date = dates.min.clone();
            const diff = _.round(
                dates.max.clone().diff(date, 'month') / _.size(agents)
            );

            const agentContracts = _.map(agents, (agent, i) => {
                const agentId = agent._id;
                const startDate = date.clone().toDate();
                const endDate = date.add((i + 1) * diff, 'month').toDate();

                return {
                    type: 'contract',
                    contractType: 'agent',
                    agentId,
                    playerId: monk.id(playerId),
                    startDate,
                    endDate
                };
            });

            return _.concat(playerContracts, marketvalues, agentContracts);
        }
    );

    if (_.isEmpty(docs)) {
        return null;
    }

    return dbs.football.get('people').insert(_.concat(docs, fakeAgents));
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
            const max = _.random(50, 70);
            const min = 100 - max;
            return _.map(TeamGames, (fantasy, i) => {
                const statistic = {};
                statistic.type = 'statistic';
                statistic.gameId = gameId;
                statistic.teamId = TeamCache.get(fantasy.TeamId);

                statistic.possession = possessions[i];
                statistic.fantasy = fantasy;
                return _.assign(statistic, parser.stats(fantasy));
            });
        },
        playerStatistics: (game, PlayerGames) => {
            const positions = {
                GK: ['Goalkeeper'],
                D: [
                    'Centre Back',
                    'Left Back',
                    'Right Back',
                    'Left Wing Back',
                    'Right Wing Back'
                ],
                M: [
                    'Defensive Midfield',
                    'Central Midfield',
                    'Attacking Midfield',
                    'Left Wing',
                    'Right Wing',
                    'Left Midfield'
                ],
                A: ['Centre Forward', 'Withdrawn Striker']
            };

            return _.map(PlayerGames, fantasy => {
                const statistic = {};
                statistic.type = 'statistic';
                statistic.gameId = game._id;
                statistic.teamId = TeamCache.get(fantasy.TeamId);
                statistic.playerId = PlayerCache.get(fantasy.PlayerId);

                statistic.started = fantasy.Started > 0;
                statistic.minutes = _.round(fantasy.Minutes);
                statistic.fantasy = fantasy;
                if (statistic.minutes <= 0) {
                    return statistic;
                }

                if (statistic.minutes > game.gameTime) {
                    statistic.minutes = game.gameTime;
                }
                statistic.positionCategory = fantasy.PositionCategory;
                statistic.position = _.sample(positions[fantasy.Position]);
                return _.assign(statistic, parser.stats(fantasy));
            });
        },
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
        }
    };

    const { games, events, statistics, awards } = _.reduce(
        BoxScores,
        (reduced, BoxScore) => {
            const max = _.maxBy(BoxScore.PlayerGames, 'Minutes');
            let minutes = _.round(max.Minutes);
            if (minutes < 90) {
                minutes = 90;
            } else {
                minutes = _.random(90, minutes);
            }
            const game = converters.game(BoxScore.Game, minutes);
            reduced.games.push(game);

            reduced.events = _.concat(
                reduced.events,
                converters.goals(game._id, BoxScore.Goals),
                converters.cards(game._id, BoxScore.Bookings),
                converters.substitutions(game._id, BoxScore.Lineups)
            );

            reduced.statistics = _.concat(
                reduced.statistics,
                converters.teamStatistics(game._id, BoxScore.TeamGames),
                converters.playerStatistics(game, BoxScore.PlayerGames)
            );

            reduced.awards.push(
                converters.award(game._id, BoxScore.Game, BoxScore.Lineups)
            );

            return reduced;
        },
        {
            games: [],
            events: [],
            statistics: [],
            awards: []
        }
    );

    return Promise.all([
        dbs.football.get('games').insert(games),
        dbs.football.get('statistics').insert(_.concat(events, statistics)),
        dbs.football.get('people').insert(awards)
    ]);
};

// {
//   competitions: 27,
//   games: 6337,
//   teams: 241,
//   memberships: 24966,
//   players: 12093
// }

const convert = areas => {
    const tasks = auto({
        competitions: () => {
            const spinner = ora().start('Load competitions');

            let query = Promise.resolve([]);
            if (_.isString(areas)) {
                query = dbs.fantasy
                    .get('hierarchy')
                    .findOne({ Name: areas })
                    .then(one => [one]);
            } else if (_.isArray(areas)) {
                query = dbs.fantasy
                    .get('hierarchy')
                    .find({ Name: { $in: areas } });
            } else {
                query = dbs.fantasy
                    .get('boxScores')
                    .find({ Lineups: [] }, { 'Game.RoundId': 1, _id: 0 })
                    .then(BoxScores => _.uniq(_.map(BoxScores, 'Game.RoundId')))
                    .then(RoundIds =>
                        dbs.fantasy.get('hierarchy').find({
                            $and: [
                                {
                                    'Competitions.Seasons.Rounds.RoundId': {
                                        $exists: true
                                    }
                                },
                                {
                                    'Competitions.Seasons.Rounds.RoundId': {
                                        $nin: RoundIds
                                    }
                                }
                            ]
                        })
                    );
            }

            return Promise.resolve(query)
                .then(docs => _.flatMap(docs, 'Competitions'))
                .tap(r => {
                    spinner.text = `Converting ${_.size(r)} competitions`;
                })
                .then(CompetitionsConverter)
                .tap(r =>
                    spinner.succeed(
                        `Created ${_.size(r.SeasonIds)} competitions`
                    )
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
                                        _.uniqBy(group, 'TeamId')
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
            }
        ],
        memberships: [
            'teams',
            ({ teams }) =>
                dbs.fantasy.get('memberships').find({ TeamId: { $in: teams } })
        ],
        managers: [
            'teams',
            ({ teams }) => {
                const spinner = ora().start(
                    'Generate managers and contracts and awards ...'
                );

                const contractType = 'manager';
                const { managers, contracts } = _.reduce(
                    teams,
                    (r, TeamId) => {
                        const teamId = TeamCache.get(TeamId);
                        const managers = _.times(_.random(2, 4), fakePerson);
                        r.managers = _.concat(r.managers, managers);

                        const date = moment
                            .utc()
                            .add(_.random(1, 2), 'year')
                            .dayOfYear(_.random(1, 365))
                            .startOf('day');

                        const contracts = _.map(managers, manager => {
                            const managerId = manager._id;
                            const endDate = date.toDate();
                            const startDate = date
                                .subtract(_.random(2, 4), 'year')
                                .dayOfYear(_.random(1, 365))
                                .toDate();

                            return {
                                type: 'contract',
                                contractType,
                                teamId,
                                managerId,
                                startDate,
                                endDate
                            };
                        });
                        r.contracts = _.concat(r.contracts, contracts);

                        return r;
                    },
                    { managers: [], contracts: [] }
                );

                const month = moment
                    .utc()
                    .startOf('month')
                    .subtract(1, 'month');
                const awards = _.times(30, i => {
                    const awardType = 'ManagerOfTheMonthAward';
                    const date = month.clone().subtract(i, 'month');

                    const managerId = _.chain(contracts)
                        .filter(contract =>
                            date.isBetween(
                                contract.startDate,
                                contract.endDate,
                                'month'
                            )
                        )
                        .sample()
                        .get('managerId')
                        .value();

                    return {
                        type: 'award',
                        awardType,
                        managerId,
                        date: date.toDate()
                    };
                });

                return dbs.football
                    .get('people')
                    .insert(_.concat(managers, contracts, awards))
                    .then(() =>
                        spinner.succeed(
                            `Generated ${_.size(
                                managers
                            )} managers and ${_.size(
                                contracts
                            )} contracts and ${_.size(awards)} awards`
                        )
                    );
            }
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
            }
        ],
        contracts: [
            'memberships',
            'players',
            ({ memberships }) => ContractsConverter(memberships)
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
                        .tap(r =>
                            spinner.succeed(`Created ${_.size(r[0])} games`)
                        );
                });
            }
        ]
    });

    return Promise.resolve(tasks).finally(dbs.close);
};

module.exports = convert;
