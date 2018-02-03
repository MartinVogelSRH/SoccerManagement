'use strict';

const _ = require('lodash');
const monk = require('monk');
const auto = require('p-auto');
const moment = require('moment');
const config = require('config');

const MappingService = require('./mappings');

const dumpDB = monk(config.get('databases.fantasy'));
const footballDB = monk(config.get('databases.football'));
const exit = () =>
    Promise.all([dumpDB.close(), footballDB.close()]).then(() =>
        process.exit()
    );

const buildDate = date => moment.utc(_.replace(date, /T.*$/, '')).toDate();

const buildContract = (mappings, fantasy) => {
    const teamId = _.get(mappings, ['team', fantasy.TeamId, 'objectId']);
    const playerId = _.get(mappings, ['player', fantasy.PlayerId, 'objectId']);
    if (!teamId || !playerId) {
        return null;
    }
    const _id = monk.id();
    const startDate = buildDate(fantasy.StartDate);

    const contract = { _id, teamId, playerId, startDate };
    if (fantasy.Active === false && fantasy.EndDate) {
        contract.endDate = buildDate(fantasy.EndDate);
    }

    return contract;
};

const reducer = mappings => (result, fantasy) => {
    const contract = buildContract(mappings, fantasy);
    if (!contract) {
        return result;
    }
    result.contracts.push(contract);

    const mapping = MappingService.build('membership', fantasy.MembershipId, contract._id);
    result.mappings.push(mapping);

    return result;
};

const tasks = {
    memberships: dumpDB.get('memberships').find({}),
    mappings: MappingService.get(['team', 'player']),
    contracts: [
        'memberships',
        'mappings',
        results => {
            const data = _.reduce(
                results.memberships,
                reducer(results.mappings),
                {
                    contracts: [],
                    mappings: [],
                }
            );
            if (_.isEmpty(data.contracts) || _.isEmpty(data.mappings)) {
                return null;
            }

            const contracts = footballDB
                .get('contracts')
                .insert(data.contracts);
            const mappings = dumpDB.get('mappings').insert(data.mappings);
            return Promise.all([contracts, mappings]);
        },
    ],
};

auto(tasks)
    .catch(console.error)
    .then(exit, exit);
