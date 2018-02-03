'use strict';

const _ = require('lodash');
const monk = require('monk');
const config = require('config');

const collection = monk(config.get('databases.fantasy')).get('mappings');

const build = (type, fantasyId, objectId) => ({
    type,
    fantasyId,
    objectId,
});

const insert = data => collection.insert(data);

const get = (types, key = 'fantasyId') =>
    collection.find({ type: { $in: types } }).then(mappings =>
        _.chain(mappings)
            .groupBy('type')
            .mapValues(group => _.keyBy(group, key))
            .value()
    );

module.exports = { build, insert, get };
