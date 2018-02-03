'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const config = require('config');
const moment = require('moment');
const Promise = require('bluebird');

const ora = require('ora');

const spinner = ora().start('Starting ...');

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

const cache = {
    store: {},
    get: (type, id) => cache.store[type] && cache.store[type][id],
    set: (type, id, value) => {
        if (!cache.store[type]) {
            cache.store[type] = {};
        }
        cache.store[type][id] = value;
        return value;
    },
    pick: (type, ids) => _.pick(cache.store[type], ids),
    assign: (type, obj) => {
        cache.store[type] = _.assign(cache.store[type], obj);
        return obj;
    },
};

const generateTeams = fantasyTeams => {
    const teams = _.reduce(
        fantasyTeams,
        (result, fantasy) => {
            const cached = cache.get('teams', fantasy.TeamId);
            if (cached) {
                result.ids.push(cached);
                return result;
            }

            const _id = monk.id();
            const type = fantasy.Type;
            const name = fantasy.Name;
            const country = fantasy.AreaName;

            const team = { _id, type, name, country, fantasy };
            if (type === 'Club') {
                team.city = fantasy.City;
            }

            result.ids.push(_id);
            result.insert.push(team);
            cache.set('teams', fantasy.TeamId, _id);
            return result;
        },
        { insert: [], ids: [] }
    );

    spinner.info(`Adding ${_.size(teams.insert)}/${_.size(teams.ids)} teams`);
    if (_.isEmpty(teams.insert)) {
        return teams.ids;
    }

    return dbs.football
        .get('teams')
        .insert(teams.insert)
        .then(() => teams.ids);
};

const generatePlayers = fantasyPlayers => {
    const players = _.reduce(
        fantasyPlayers,
        (insert, fantasy) => {
            const cached = cache.get('players', fantasy.PlayerId);
            if (cached) {
                return insert;
            }

            const _id = monk.id();
            const type = 'person';

            // NOTE: There was one player without a first name so just to be sure
            const firstName =
                fantasy.FirstName || _.split(fantasy.CommonName, ' ')[0];
            const lastName = fantasy.LastName;
            const nationality = fantasy.Nationality;
            const dateOfBirth = parser.date(fantasy.BirthDate);

            cache.set('players', fantasy.PlayerId, _id);
            insert.push({
                _id,
                type,
                firstName,
                lastName,
                nationality,
                dateOfBirth,
                fantasy,
            });
            return insert;
        },
        []
    );

    spinner.info(`Adding ${_.size(players)}/${_.size(fantasyPlayers)} players`);
    if (_.isEmpty(players)) {
        return null;
    }

    return dbs.football
        .get('people')
        .insert(players)
        .then(() => players.ids);
};

const generateContracts = fantasyMemberships => {
    const fantasyPlayerIds = _.map(fantasyMemberships, 'PlayerId');

    return dbs.fantasy
        .get('players')
        .find({ PlayerId: { $in: fantasyPlayerIds } })
        .then(generatePlayers)
        .then(() => {
            const contracts = _.map(fantasyMemberships, fantasy => {
                const type = 'contract';
                const teamId = cache.get('teams', fantasy.TeamId);
                const playerId = cache.get('players', fantasy.PlayerId);

                const salary = _.random(1, 70) * 1000000;
                const startDate = parser.date(fantasy.StartDate);

                const contract = { type, teamId, playerId, salary, startDate };
                if (fantasy.EndDate) {
                    contract.endDate = parser.date(fantasy.EndDate);
                }

                return contract;
            });

            spinner.info(`Adding ${_.size(contracts)} contracts`);
            if (_.isEmpty(contracts)) {
                return null;
            }

            return dbs.football.get('people').insert(contracts);
        });
};

const generateGames = fantasyGames => {
    const games = _.map(fantasyGames, fantasy => {
        const _id = monk.id();
        cache.set('games', fantasy.GameId, _id);

        const competitionId = cache.get('rounds', fantasy.RoundId);
        const homeTeamId = cache.get('teams', fantasy.HomeTeamId);
        const awayTeamId = cache.get('teams', fantasy.AwayTeamId);

        const gameTime = _.random(90, 100);
        const startDate = parser.datetime(fantasy.DateTime);
        const endDate = moment
            .utc(startDate)
            .add(gameTime + 15, 'minutes')
            .toDate();

        return {
            _id,
            competitionId,
            homeTeamId,
            awayTeamId,
            gameTime,
            startDate,
            endDate,
            fantasy,
        };
    });

    spinner.info(`Adding ${_.size(games)} games`);
    if (_.isEmpty(games)) {
        return null;
    }

    return dbs.football.get('games').insert(games);
};

const generateEvents = fantasyBoxScores => {
    const type = 'event';
    const events = _.flatMap(fantasyBoxScores, fantasyBoxScore => {
        const gameId = cache.get('games', fantasyBoxScore.Game.GameId);

        const cards = _.map(fantasyBoxScore.Bookings, fantasy => {
            const teamId = cache.get('teams', fantasy.TeamId);
            const playerId = cache.get('players', fantasy.PlayerId);

            const eventType = fantasy.Type;
            let gameMinute = _.toString(fantasy.GameMinute);
            if (fantasy.GameMinuteExtra) {
                gameMinute += ` +${fantasy.GameMinute}`;
            }

            return {
                type,
                gameId,
                teamId,
                playerId,
                eventType,
                gameMinute,
                fantasy,
            };
        });

        const goals = _.map(fantasyBoxScore.Goals, fantasy => {
            const teamId = cache.get('teams', fantasy.TeamId);
            const playerId = cache.get('players', fantasy.PlayerId);

            const eventType = _.words(fantasy.Type).join(' ') || 'Goal';
            let gameMinute = _.toString(fantasy.GameMinute);
            if (fantasy.GameMinuteExtra) {
                gameMinute += ` +${fantasy.GameMinute}`;
            }

            const goal = {
                type,
                gameId,
                teamId,
                playerId,
                eventType,
                gameMinute,
                fantasy,
            };

            if (fantasy.AssistedByPlayerId1) {
                goal.additionalPlayerId = cache.get(
                    'players',
                    fantasy.AssistedByPlayerId1
                );
            }

            return goal;
        });

        const substitutions = _.chain(fantasyBoxScore.Lineups)
            .filter(['Type', 'Substitute In'])
            .map(fantasy => {
                const teamId = cache.get('teams', fantasy.TeamId);
                const playerId = cache.get('players', fantasy.PlayerId);
                const additionalPlayerId = cache.get(
                    'players',
                    fantasy.ReplacedPlayerId
                );

                const eventType = 'Substitution';
                let gameMinute = _.toString(fantasy.GameMinute);
                if (fantasy.GameMinuteExtra) {
                    gameMinute += ` +${fantasy.GameMinute}`;
                }

                return {
                    type,
                    gameId,
                    teamId,
                    playerId,
                    additionalPlayerId,
                    eventType,
                    gameMinute,
                    fantasy,
                };
            })
            .value();

        return _.concat(cards, goals, substitutions);
    });

    spinner.info(`Adding ${_.size(events)} events`);
    if (_.isEmpty(events)) {
        return null;
    }

    return dbs.football.get('statistics').insert(events);
};

const generateStatistics = fantasyBoxScores => {
    const type = 'statistic';
    const stats = _.flatMap(fantasyBoxScores, fantasyBoxScore => {
        const gameId = cache.get('games', fantasyBoxScore.Game.GameId);

        const teamStats = _.map(fantasyBoxScore.TeamGames, fantasy => {
            const teamId = cache.get('teams', fantasy.TeamId);

            const stats = parser.stats(fantasy);
            return _.assign({ type, gameId, teamId, fantasy }, stats);
        });

        const playerStats = _.map(fantasyBoxScore.PlayerGames, fantasy => {
            const teamId = cache.get('teams', fantasy.TeamId);
            const playerId = cache.get('players', fantasy.PlayerId);

            const stats = parser.stats(fantasy);
            const position = fantasy.Position;
            const started = fantasy.Started > 0;
            const minutes = _.round(fantasy.Minutes);
            return _.assign(
                {
                    type,
                    gameId,
                    teamId,
                    playerId,
                    position,
                    started,
                    minutes,
                    fantasy,
                },
                stats
            );
        });

        return _.concat(teamStats, playerStats);
    });

    spinner.info(`Adding ${_.size(stats)} stats`);
    if (_.isEmpty(stats)) {
        return null;
    }

    return dbs.football.get('statistics').insert(stats);
};

const generateSeason = fantasy => {
    const tasks = auto({
        fantasyTeams: () => {
            const query = { SeasonId: fantasy.season.SeasonId };
            return dbs.fantasy
                .get('seasonTeams')
                .find(query, { Team: 1 })
                .then(docs => _.map(docs, 'Team'));
        },
        fantasyBoxScores: () => {
            const fantasyRoundIds = _.map(fantasy.season.Rounds, 'RoundId');
            const query = { 'Game.RoundId': { $in: fantasyRoundIds } };
            return dbs.fantasy.get('boxScores').find(query, {
                Game: 1,
                Lineups: 1,
                Goals: 1,
                Bookings: 1,
                TeamGames: 1,
                PlayerGames: 1,
            });
        },
        teams: [
            'fantasyTeams',
            ({ fantasyTeams }) => generateTeams(fantasyTeams),
        ],
        players: [
            'fantasyTeams',
            'teams',
            ({ fantasyTeams }) => {
                const fantasyTeamIds = _.map(fantasyTeams, 'TeamId');
                const query = { TeamId: { $in: fantasyTeamIds } };
                return dbs.fantasy
                    .get('memberships')
                    .find(query)
                    .then(generateContracts);
            },
        ],
        competition: [
            'teams',
            ({ teams }) => {
                const _id = monk.id();
                cache.set('seasons', fantasy.season.SeasonId, _id);
                _.forEach(fantasy.season.Rounds, round => {
                    cache.set('rounds', round.RoundId, _id);
                });

                const type = fantasy.competition.Type;
                const format = fantasy.competition.Format;

                const name = fantasy.season.CompetitionName;
                const season = fantasy.season.Name;
                const country = fantasy.competition.AreaName;

                const startDate = parser.date(fantasy.season.StartDate);
                const endDate = parser.date(fantasy.season.EndDate);

                spinner.info(
                    `Adding competition for ${_.size(
                        fantasy.season.Rounds
                    )} rounds`
                );
                return dbs.football.get('competitions').insert({
                    _id,
                    type,
                    format,
                    name,
                    season,
                    country,
                    startDate,
                    endDate,
                    teams,
                    fantasy,
                });
            },
        ],
        game: [
            'fantasyBoxScores',
            'teams',
            'players',
            'competition',
            ({ fantasyBoxScores }) => {
                const fantasyGames = _.map(fantasyBoxScores, 'Game');
                return generateGames(fantasyGames);
            },
        ],
        events: [
            'fantasyBoxScores',
            'game',
            ({ fantasyBoxScores }) => generateEvents(fantasyBoxScores),
        ],
        statistics: [
            'fantasyBoxScores',
            'game',
            ({ fantasyBoxScores }) => generateStatistics(fantasyBoxScores),
        ],
    });
    return Promise.resolve(tasks);
};

// Bundesliga
const query = { 'Competitions.CompetitionId': 2 };
dbs.fantasy
    .get('hierarchy')
    .findOne(query, { Competitions: 1 })
    .then(({ Competitions }) => {
        const Competition = _.head(Competitions);

        const competition = _.omit(Competition, ['Seasons']);
        const seasons = Competition.Seasons;
        const total = _.size(Competition.Seasons);
        return Promise.mapSeries(seasons, (season, i) => {
            spinner.text = `Generate season ${i + 1} of ${total}`;
            return generateSeason({ competition, season });
        });
    })
    .then(() => spinner.succeed())
    .catch(err => {
        spinner.fail(err);
        console.error(err);
    })
    .then(dbs.close);
