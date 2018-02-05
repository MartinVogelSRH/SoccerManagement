const ora = require('ora');
const convert = require('./index');

const converted = convert();
const text = 'Converting all fantasy data';
ora.promise(converted, text);
