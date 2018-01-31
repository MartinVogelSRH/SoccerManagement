'use strict';
const _ = require('lodash');
const monk = require('monk');
const moment = require('moment');
const config = require('config');

const db = monk(config.get('databases.football'));
const exit = () => db.close().then(() => process.exit());

const buildDate = date => moment.utc(date).toDate();

const regex = /^\d{4}-\d{2}-\d{2}$/;
const updater = (collection, keys) => docs =>
    Promise.all(
        _.map(docs, doc =>
            collection.update(
                { _id: doc._id },
                _.reduce(
                    keys,
                    (update, key) => {
                        const date = doc[key];
                        if (regex.test(date) === false) {
                            _.set(update, ['$unset', key]);
                        } else {
                            _.set(update, ['$set', key], buildDate(date));
                        }
                        return update;
                    },
                    {}
                )
            )
        )
    );

const contracts = () => {
    const collection = db.get('contracts');
    return collection
        .find({})
        .then(updater(collection, ['startDate', 'endDate']));
};
const people = () => {
    const collection = db.get('people');
    return collection.find({}).then(updater(collection, ['birthday']));
};

Promise.all([get()])
    .catch(console.error)
    .then(exit, exit);
