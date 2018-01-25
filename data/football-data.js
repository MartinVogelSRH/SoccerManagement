const got = require('got');

const api = (url, opt) =>
    got.get(
        `https://www.football-data.org/v1/${url.replace(/^\/?/, '')}`,
        Object.assign({ json: true }, opt)
    );

const competitions = () => api('competitions').then(res => res.body);

const teams = id =>
    api(`competitions/${id}/teams`).then(res =>
        res.body.teams.map(team => {
            let id = team.id;
            if (!id) {
                const match = team._links.self.href.match(/\/teams\/(\d+)/);
                if (match) {
                    id = parseInt(match[1]);
                }
            }
            return Object.assign({ id }, team);
        })
    );

const players = id => api(`teams/${id}/players`).then(res => res.body.players);

module.exports = { api, competitions, teams, players };
