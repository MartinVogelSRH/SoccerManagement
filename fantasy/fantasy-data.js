'use strict';
const got = require('got');

const Fantasy = opt => {
    const { subscriptionKeys } = Object.assign({ subscriptionKeys: [] }, opt);

    const subscription = {
        keys: subscriptionKeys.reduce((o, k) => {
            o[k] = true;
            return o;
        }, {}),
        get: () => subscriptionKeys.find(k => subscription.keys[k]),
    };

    const api = (type, endpoint, opt) => {
        const key = subscription.get();
        if (!key) {
            return Promise.reject(new Error('No valid subscription key left'));
        }

        const url = `https://api.fantasydata.net/v3/soccer/${type}/json/${endpoint}`;

        const options = Object.assign({ json: true }, opt);
        options.headers = Object.assign(
            { 'Ocp-Apim-Subscription-Key': key },
            options.headers
        );

        return got(url, options)
            .then(res => res.body)
            .catch(err => {
                if (err.statusCode === 403) {
                    subscription.keys[key] = false;
                    return api(type, endpoint, opt);
                }
                return Promise.reject(err);
            });
    };

    const teams = () => api('stats', 'Teams');
    const venues = () => api('stats', 'Venues');
    const players = () => api('stats', 'Players');
    const competitions = () => api('stats', 'Competitions');
    const competitionHierarchy = () => api('stats', 'CompetitionHierarchy');
    const activeMemberships = () => api('stats', 'ActiveMemberships');
    const historicalMemberships = () => api('stats', 'HistoricalMemberships');

    const schedule = roundId => api('stats', `Schedule/${roundId}`);
    const standings = roundId => api('stats', `Standings/${roundId}`);
    const teamSeasonStats = roundId =>
        api('stats', `TeamSeasonStats/${roundId}`);
    const playerSeasonStats = roundId =>
        api('stats', `PlayerSeasonStats/${roundId}`);

    const boxScores = day => api('stats', `BoxScores/${day}`);
    const teamGameStatsByDate = day =>
        api('stats', `TeamGameStatsByDate/${day}`);
    const playerGameStatsByDate = day =>
        api('stats', `PlayerGameStatsByDate/${day}`);
    const playerGameProjectionStatsByDate = day =>
        api('projections', `PlayerGameProjectionStatsByDate/${day}`);

    return {
        teams,
        venues,
        players,
        competitions,
        competitionHierarchy,
        activeMemberships,
        historicalMemberships,
        schedule,
        standings,
        teamSeasonStats,
        playerSeasonStats,
        boxScores,
        teamGameStatsByDate,
        playerGameStatsByDate,
        playerGameProjectionStatsByDate,
    };
};

module.exports = Fantasy;
