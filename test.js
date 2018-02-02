'use strict';

const _ = require('lodash');
const monk = require('monk');
const config = require('config');

const ora = require('ora');


const uri = config.get('databases.fantasy');
const spinner = ora().start(`connecting to database ${uri}`);
monk(uri)
    .then(db => {
        spinner.info(`connected to database ${uri}`);


        db.get('mappings').find({ type: 'team' })
            .then(mappings =>
                _.chain(mappings)
                    .keyBy('fantasyId')
                    .mapValues('objectId')
                    .value()
            )
            .then(r => spinner.succeed(`results: ${JSON.stringify(r, null, 2)}`))
            .catch(e => spinner.fail(e))
            .then(db.close);
    });
