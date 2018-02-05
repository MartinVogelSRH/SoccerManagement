const ora = require('ora');
const convert = require('./index');

const spinner = ora().start('Converting all bundesliga data');
convert('Germany')
    .then(() => spinner.succeed('Converted all bundesliga data'))
    .catch(err =>
        spinner.fail(`Error converting bundesliga data: ${err.message}`)
    );
