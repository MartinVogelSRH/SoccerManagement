'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const pretty = require('pretty-hrtime');
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
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'uc 3',
    'uc 4',
    'uc 5',
];

Promise.resolve(all(working))
    .mapSeries(({ description, command, id }) => {
        const info = `${id}):`;
        if (_.isEmpty(command)) {
            ora().warn(`${info} ${description} is empty, skipping ...`);
            return null;
        }

        const spinner = ora().start(`${info} ${description}`);
        const start = process.hrtime();
        return run(command)
            .then(r => {
                const end = process.hrtime(start);
                const batch = _.get(r, ['cursor', 'firstBatch']);
                spinner.text = `${info} ${description} (${pretty(end)})`;
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
