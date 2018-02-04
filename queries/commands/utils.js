'use strict';

const { ObjectId } = require('mongojs');
const ISODate = date => new Date(date);

module.exports = { ObjectId, ISODate };
