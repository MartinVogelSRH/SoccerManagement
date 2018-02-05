'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const ora = require('ora');
// const inquirer = require('inquirer');

const commands = require('./commands');

const db = mongojs('bundesliga-database');
const run = command =>
    Promise.fromCallback(callback => db.runCommand(command, callback));

const all = () => commands;
const one = id => [_.find(commands, ['id', id])];
const some = ids => _.filter(commands, command => _.includes(ids, command.id));
const exclude = ids =>
    _.reject(commands, command => _.includes(ids, command.id));

const working = [
    'a',
    'b',
    'c',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'n',
    'o',
    'uc 3',
];

Promise.resolve(all(working))
    .mapSeries(({ description, command, id }) => {
        const info = `${id}):`;
        if (_.isEmpty(command)) {
            ora().warn(`${info} Is empty, skipping ...`);
            return null;
        }

        const spinner = ora().start(`${info} ${description}`);
        return run(command)
            .then(r => {
                const batch = _.get(r, ['cursor', 'firstBatch']);
                if (_.isEmpty(batch)) {
                    spinner.fail();
                } else {
                    spinner.succeed();
                }
                // spinner.info(JSON.stringify(batch, null, 2));
            })
            .catch(err => {
                spinner.fail();
                console.error(err);
            });
    })
    .finally(() => db.close());
