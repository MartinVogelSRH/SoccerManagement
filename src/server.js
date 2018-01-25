'use strict';

const Koa = require('koa');

const createServer = ({ db }) => {
    const server = new Koa();

    server.context.db = db;

    server.use((ctx, next) => {
        console.log(ctx);
    });

    return server;
};

module.exports = createServer;
