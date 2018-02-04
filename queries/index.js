'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const ora = require('ora');
// const inquirer = require('inquirer');

const commands = require('./commands');

const db = mongojs('football-database');
const run = command =>
    Promise.fromCallback(callback => db.runCommand(command, callback));

Promise.resolve(commands)
    .mapSeries(({ description, command }, index) => {
        const info = `Command #${index + 1}:`;
        if (_.isEmpty(command)) {
            ora().warn(`${info} Is empty, skipping ...`);
            return null;
        }

        const spinner = ora().start(`${info} ${description}`);
        return run(command)
            .then(r => {
                const batch = _.get(r, ['cursor', 'firstBatch']);
                spinner.succeed();
                spinner.info(JSON.stringify(batch, null, 2));
            })
            .catch(err => spinner.fail(`${info} ${err.message}`));
    })
    .finally(() => db.close());
