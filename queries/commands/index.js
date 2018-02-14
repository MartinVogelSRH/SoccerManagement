module.exports = [
    {
        id: 'a',
        description: 'Average attendance - club (last season)',
        command: require('./01-average-attendance')
    },
    {
        id: 'b',
        description: 'Clean sheet - club (current season)',
        command: require('./02-clean-sheet')
    },
    {
        id: 'c',
        description: 'Player Name, Player Age, Market value, Current club – player (each year)',
        command: require('./03-player-info')
    },
    {
        id: 'd',
        description: 'Weekly wage bill – club',
        command: require('./04-weekly-wage')
    },
    {
        id: 'e',
        description: 'Manager of the month award – manager',
        command: require('./05-manager-of-the-month')
    },
    {
        id: 'f',
        description: 'Yellow / red yellow / red cards – player (till date)',
        command: require('./06-cards-player')
    },
    {
        id: 'g',
        description: 'Stats – club (last five matches)',
        command: require('./07-team-stats')
    },
    {
        id: 'h',
        description: 'Most assists – player (till date)',
        command: require('./08-most-assists')
    },
    {
        id: 'i',
        description: 'Average possession kept – clubs',
        command: require('./09-average-possession')
    },
    {
        id: 'j',
        description: 'Number of minutes played – player (till date)',
        command: require('./10-minutes-played')
    },
    {
        id: 'k',
        description: 'Man of the match – player (till date)',
        command: require('./11-man-of-the-match')
    },
    {
        id: 'l',
        description: 'All positions played – player (season possibility check)',
        command: require('./12-position-played')
    },
    {
        id: 'm',
        description:
            'Football-agent maximum number of represented player – Football-agent (given league)',
        command: require('./13-agent-represent')
    },
    {
        id: 'n',
        description: 'Best / worst team – club (week --> performance metrics)',
        command: require('./14-best-worst-team')
    },
    {
        id: 'o',
        description: 'Signing a striker for the best fitting - club (all stats)',
        command: require('./15-signing-striker')
    },
    {
        id: 'uc 1',
        description: 'Most goals from a striker',
        command: require('./16-use-case-one')
    },
    {
        id: 'uc 2',
        description: 'Top 5 fouling player',
        command: require('./17-use-case-two')
    },
    {
        id: 'uc 3',
        description: 'Club statistics',
        command: require('./18-use-case-three')
    },
    {
        id: 'uc 4',
        description: 'Player information',
        command: require('./19-use-case-four')
    },
    {
        id: 'uc 5',
        description: 'Top 10 yellow cards',
        command: require('./20-use-case-five')
    }
];
