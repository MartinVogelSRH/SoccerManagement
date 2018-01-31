'use strict';

const path = require('path');
const { spawn } = require('child_process');

const _ = require('lodash');
const config = require('config');

const cwd = __dirname;
const archive = path.join(cwd, `football-mongodump.gz`);
const db = _.last(config.get('databases.football').split('/'));

const mongodump = spawn(
    'mongodump',
    [`--db=${db}`, `--gzip`, `--archive=${archive}`],
    { cwd }
);

mongodump.stdout.on('data', data => console.log(data.toString().trim()));
mongodump.stderr.on('data', data => console.error(data.toString().trim()));
