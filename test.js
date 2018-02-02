const monk = require('monk');
const config = require('config');

const ora = require('ora');
const ObjectId = monk.id;

const uri = config.get('databases.fantasy');
const spinner = ora().start(`connecting to database ${uri}`);
monk(uri)
    .then(db => {
        spinner.info(`connected to database ${uri}`);

        const query = { _id: 123 };
        const update = { $set: { a: 1 } };
        spinner.info(`findOneAndUpdate: ${JSON.stringify({ query, update }, null, 2)}`);
        db.get('competitions').findOneAndUpdate(query, update)
            .then(r => spinner.succeed(`results: ${JSON.stringify(r)}`))
            .catch(e => spinner.fail(e))
            .then(db.close);
    });
