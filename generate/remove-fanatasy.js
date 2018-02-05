const ora = require('ora');
const monk = require('monk');
const Promise = require('bluebird');

const collections = ['competitions', 'games', 'people', 'statistics', 'teams'];

const unset = db => collection => {
    const query = db
        .get(collection)
        .update({}, { $unset: { fantasy: 1 } }, { multi: true });

    const spinner = ora().start(`Removing fantasy data from ${collection}`);
    return Promise.resolve(query)
        .tap(r =>
            spinner.succeed(
                `Removed ${r.nModified} fantasy data from ${collection}`
            )
        )
        .catch(err =>
            spinner.fail(
                `Error removing fantasy data from ${collection}: ${err.message}`
            )
        );
};

const removeFanatsy = database => {
    const spinner = ora().start(`Connecting to ${database}`);
    return monk(database)
        .then(db => {
            spinner.succeed(`Connected to ${database}`);
            return Promise.mapSeries(collections, unset(db)).finally(db.close);
        })
        .catch(() => spinner.fail(`Failed to connect to ${database}`));
};

removeFanatsy('localhost/football-database');
