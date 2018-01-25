'use strict';

const monk = require('monk');
const config = require('config');

const createServer = require('./src/server');

const connection = config.get('db.connection');
monk(connection)
    .then(db => {
        console.log('Connected to db:', db._connectionURI);

        const server = createServer({ db });

        const port = config.get('server.port');
        server.listen(port, () => console.log(`Server listen on port ${port}`));
    })
    .catch(err => {
        console.log('Connection to db failed:', err.message);
        process.exit(1);
    });
