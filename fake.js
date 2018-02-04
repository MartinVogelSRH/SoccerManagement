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
const fake = {
    person: () => {
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
    },
};

const tasks = auto({
    playerContracts: () =>
        db
            .get('people')
            .find(
                { type: 'contract', contractType: 'player' },
                { sort: { date: -1 } }
            ),
    agents: [
        'playerContracts',
        results => {
            const agents = _.times(200, fake.person);
            const contracts = _.map(results.playerContracts, playerContract => {
                const agentId = _.sample(agents)._id;
                const contract = _.pick(playerContract, [
                    'type',
                    'playerId',
                    'startDate',
                ]);
                return _.assign({ agentId }, contract);
            });
        },
    ],
});

Promise.resolve(tasks)
    .catch(console.error)
    .then(dbs.close);
