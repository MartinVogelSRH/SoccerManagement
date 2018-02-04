'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const config = require('config');
const moment = require('moment');
const Promise = require('bluebird');

const ora = require('ora');

const db = monk(config.get('databases.football'));
const query = { type: 'contract', contractType: 'player' };

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
