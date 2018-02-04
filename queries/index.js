'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongojs = require('mongojs');
const ora = require('ora');
// const inquirer = require('inquirer');

const commands = _.take(require('./commands'), 1);

const db = mongojs('football-database');
const run = command =>
    Promise.fromCallback(callback => db.runCommand(command, callback));

Promise.mapSeries(commands, ({ description, command }, index) => {
    const spinner = ora().start(`Command #${index + 1}: ${description}`);
    return run(command).then(r => {
        spinner.succeed(`Command #${index + 1}: ok=${r.ok}`);
        console.log(r);
    });
}).finally(() => db.close());
