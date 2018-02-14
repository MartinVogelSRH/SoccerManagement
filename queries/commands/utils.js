'use strict';

const { ObjectId } = require('mongodb');
const ISODate = date => {
    if (date) {
        return new Date(date);
    }
    const now = Date.now();
    return new Date(now);
};

module.exports = { ObjectId, ISODate };
