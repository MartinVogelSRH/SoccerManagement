'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const mongodb = require('mongodb');
const pretty = require('pretty-hrtime');
const ora = require('ora');

const commands = require('./commands');

const all = () => commands;
const one = id => [_.find(commands, ['id', id])];
const some = ids => _.filter(commands, command => _.includes(ids, command.id));
const exclude = ids => _.reject(commands, command => _.includes(ids, command.id));

const spin = ora().start('Connecting to database');
mongodb.connect('mongodb://localhost/bundesliga-database', {}, (err, db) => {
    if (err) {
        return spin.fail(err);
    }
    spin.succeed('Connected to database');

    const run = command => Promise.fromCallback(callback => db.command(command, callback));

    return Promise.resolve(all())
        .mapSeries(({ description, command, id }) => {
            const info = `${id})`;
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
});
