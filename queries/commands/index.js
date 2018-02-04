module.exports = [
    {
        description: 'Average attendance - club (last season)',
        command: require('./01-average-attendance'),
    },
    {
        description: 'Clean sheet - club (current season)',
        command: require('./02-clean-sheet'),
    },
    {
        description:
            'Player Name, Player Age, Market value, Current club – player (each year)',
        command: require('./03-player-info'),
    },
    {
        description: 'Weekly wage bill – club',
        command: require('./04-weekly-wage'),
    },
    {
        description: 'Manager of the month award – manager',
        command: require('./05-manager-of-the-month'),
    },
    {
        description: 'Yellow / red yellow / red cards – player (till date)',
        command: require('./06-cards-player'),
    },
    {
        description: 'Stats – club (last five matches)',
        command: require('./07-team-stats'),
    },
    {
        description: 'Most assists – player (till date)',
        command: require('./08-most-assists'),
    },
    {
        description: 'Average possession kept – clubs',
        command: require('./09-average-possession'),
    },
    {
        description: 'Number of minutes played – player (till date)',
        command: require('./10-minutes-played'),
    },
    {
        description: 'Man of the match – player (till date)',
        command: require('./11-man-of-the-match'),
    },
    {
        description: 'All positions played – player (season possibility check)',
        command: require('./12-position-played'),
    },
    {
        description:
            'Football-agent maximum number of represented player – Football-agent (given league)',
        command: require('./13-agent-represent'),
    },
    {
        description: 'Best / worst team – club (week --> performance metrics)',
        command: require('./14-best-worst-team'),
    },
    {
        description:
            'Signing a striker for the best fitting - club (all stats)',
        command: require('./15-signing-striker'),
    },
    {
        description: 'Use Case 1',
        command: require('./16-use-case-one'),
    },
    {
        description: 'Use Case 2',
        command: require('./17-use-case-two'),
    },
    {
        description: 'Use Case 3',
        command: require('./18-use-case-three'),
    },
    {
        description: 'Use Case 4',
        command: require('./19-use-case-four'),
    },
    {
        description: 'Use Case 5',
        command: require('./20-use-case-five'),
    },
];
