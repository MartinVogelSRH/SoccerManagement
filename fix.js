const ora = require('ora');
const _ = require('lodash');
const monk = require('monk');
const Promise = require('bluebird');

const removeDuplications = database => {
    const spinner = ora().start(`Connecting to ${database}`);
    return monk(database)
        .then(db => {
            spinner.succeed(`Connected to ${database}`);
            const query = db.get('competitions').find({});

            return Promise.resolve(query)
                .map(competition => {
                    const teams = _.chain(competition.teams)
                        .map(_.toString)
                        .uniq()
                        .map(monk.id)
                        .value();

                    return db
                        .get('competitions')
                        .update({ _id: competition._id }, { $set: { teams } });
                })
                .finally(db.close);
        })
        .catch(err =>
            spinner.fail(`Failed to connect to ${database}: ${err.message}`)
        );
};

removeDuplications('localhost/bundesliga-database');
