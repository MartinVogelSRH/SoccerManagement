'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const faker = require('faker');
const config = require('config');
const moment = require('moment');
const Promise = require('bluebird');

const ora = require('ora');

const db = monk(config.get('databases.football'));
const fakePerson = () => {
    const _id = monk.id();
    const firstName = faker.name.firstName(0);
    const lastName = faker.name.lastName(0);

    const nationality = faker.address.country();
    const dateOfBirth = moment
        .utc()
        .subtract(_.random(40, 60), 'years')
        .dayOfYear(_.random(365))
        .toDate();

    return { _id, firstName, lastName, nationality, dateOfBirth };
};

const tasks = auto({
    playerContracts: () => {
        const spinner = ora().start('Loading player contracts ...');
        const query = db
            .get('people')
            .find(
                { type: 'contract', contractType: 'player' },
                { sort: { date: -1 } }
            );
        return Promise.resolve(query).tap(r =>
            spinner.succeed(`Loaded ${_.size(r)} player contracts`)
        );
    },
    teams: () => {
        const spinner = ora().start('Loading teams ...');
        const query = db.get('teams').find({});
        return Promise.resolve(query).tap(r =>
            spinner.succeed(`Loaded ${_.size(r)} teams`)
        );
    },
    agents: [
        'playerContracts',
        results => {
            const spinner = ora().start('Generate agents and contracts ...');

            const agents = _.times(200, fakePerson);
            const type = 'contract';
            const contractType = 'agent';
            const contracts = _.map(results.playerContracts, playerContract => {
                const agentId = _.sample(agents)._id;
                const contract = _.pick(playerContract, [
                    'playerId',
                    'startDate',
                    'endDate',
                ]);
                return _.assign({ type, contractType, agentId }, contract);
            });

            return db
                .get('people')
                .insert(_.concat(agents, contracts))
                .then(() =>
                    spinner.succeed(
                        `Generated ${_.size(agents)} agents and ${_.size(
                            contracts
                        )} contracts`
                    )
                );
        },
    ],
    managers: [
        'teams',
        results => {
            const spinner = ora().start(
                'Generate managers and contracts and awards ...'
            );

            const contractType = 'manager';
            const { managers, contracts } = _.reduce(
                results.teams,
                (r, team) => {
                    const teamId = team._id;
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
                            endDate,
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
                    date: date.toDate(),
                };
            });

            return db
                .get('people')
                .insert(_.concat(managers, contracts, awards))
                .then(() =>
                    spinner.succeed(
                        `Generated ${_.size(managers)} managers and ${_.size(
                            contracts
                        )} contracts and ${_.size(awards)} awards`
                    )
                );
        },
    ],
});

Promise.resolve(tasks)
    .catch(console.error)
    .then(db.close);
