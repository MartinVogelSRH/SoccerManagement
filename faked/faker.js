'use strict';

const _ = require('lodash');
const faker = require('faker');
const moment = require('moment');


const awards = ['Man of the match', 'Manager of the month'];
const fakeAward = defaults => {
    const award = _.sample(awards);
    const date = moment.utc()
        .subtract(_.random(365), 'days')
        .toDate();

    return _.assign({ award, date }, defaults);
};


const competitionTypes = ['league', 'tournament'];
const fakeCompetition = defaults => {
    const type = _.sample(competitionTypes);
    const name = _.capitalize(faker.lorem.words());

    const year = _.random(2015, 2017);
    const season = `${year}/${year + 1}`;

    const country = faker.address.country();

    const startDate = moment.utc()
        .subtract(_.random(365), 'days')
        .year(year)
        .toDate();

    return _.assign({ type, season, country, startDate }, defaults);
};


const descriptions = ['Goal', 'Penalty Goal', 'Own Goal', 'Yellow Card', 'Yellow Red Card', 'Red Card'];
const fakeEvent = defaults => {
    const type = 'event';

    const description = _.sample(descriptions);
    const gameMinute = _.random(0, 90);

    return _.assign({ description, gameMinute }, defaults, { type });
};

const fakeContract = defaults => {
    const startDate = moment.utc()
        .subtract(_.random(365), 'days')
        .toDate();
    const endDate = moment.utc(startDate)
        .add(_.random(365), 'days')
        .toDate();

    const salary = _.random(1, 15) * 1000000;
    return _.assign({ startDate, endDate, salary }, defaults);
};


const fakeGame = defaults => {
    const startDate = moment.utc()
        .subtract(_.random(365), 'days')
        .toDate();

    const endDate = moment.utc(startDate)
        .add(_.random(105, 115), 'minutes')
        .toDate();

    return _.assign({ startDate, endDate }, defaults);
};


const fakeMarketValue = defaults => {
    const date = moment.utc()
        .subtract(_.random(365), 'days')
        .toDate();

    const value = _.random(12, 180) * 1000000;

    return _.assign({ date, value }, defaults);
};


const male = 0;
const jobs = ['player', 'manager', 'coach'];
const fakePerson = defaults => {
    const job = _.sample(jobs);
    const firstName = faker.name.firstName(male);
    const lastName = faker.name.lastName(male);

    const nationality = faker.address.country();
    const birthday = moment.utc()
        .subtract(20, 'years')
        .subtract(_.random(365), 'weeks')
        .toDate();

    return _.assign({ job, firstName, lastName, nationality, birthday }, defaults);
};
const fakePlayer = defaults => {
    const job = 'player';
    const person = fakePerson(defaults);

    return _.assign(person, { job });
};
const fakeManager = defaults => {
    const job = 'manager';
    const person = fakePerson(defaults);

    return _.assign(person, { job });
};
const fakeCoach = defaults => {
    const job = 'coach';
    const person = fakePerson(defaults);

    return _.assign(person, { job });
};


const positions = ['M', 'A', 'D', 'GK'];
const fakeStatistic = defaults => {
    const type = 'statistic';
    const position = _.sample(positions);

    const minutes = _.random(90);
    const goalAttempts = _.random(2);
    const offsides = _.random(1);
    const duels = _.random(10);
    const passes = _.random(10);
    const completedPasses = _.random(passes);

    const runningDistance = _.random(10000);
    const sprintDistance = _.random(1000);

    const averageSpeed = _.random(10, 30);

    return _.assign({ type, position, minutes, goalAttempts, offsides, duels, passes, completedPasses, runningDistance, sprintDistance, averageSpeed }, defaults);
};


const teamTypes = ['club', 'national'];
const fakeTeam = defaults => {
    const type = _.sample(teamTypes);
    const name = _.capitalize(faker.lorem.words());

    const country = faker.address.country();

    const fake = { type, name, country };
    if (type === 'club') {
        fake.city = faker.address.city();
    }

    return _.assign(fake, defaults);
};


module.exports = {
    fakeAward,
    fakeCompetition,
    fakeEvent,
    fakeContract,
    fakeGame,
    fakeMarketValue,
    fakePerson,
    fakePlayer,
    fakeManager,
    fakeCoach,
    fakeStatistic,
    fakeTeam,
};
