'use strict';

const { ObjectId } = require('mongojs');
const ISODate = date => {
    if (date) {
        return new Date(date);
    }
    const now = Date.now();
    return new Date(now);
};

const FCB = '5a7833cbafe5871e2059ca8b';

module.exports = { ObjectId, ISODate, FCB };
