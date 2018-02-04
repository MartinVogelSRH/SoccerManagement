'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const monk = require('monk');
const ora = require('ora');

const db = monk('localhost/football-database');

db
    .get('competitions')
    .find({}, { teams: 1 })
    .then(comps =>
        Promise.map(comps, comp => {
            const teams = _.map(comp.teams, id => monk.id(id));
            return db
                .get('competitions')
                .update({ _id: comp._id }, { $set: { teams } });
        })
    )
    .then(db.close);
