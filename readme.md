# Football Data Generator

> Generate football data for our football database manager

## Setup

This project uses `nodejs` to generate data.
After cloning install the dependencies using `npm` or `yarn`.

### Configuration

This project uses `config` to manage configurations.
To configure your local environment, duplicate the `config/default.js` to `config/local.js` and modify the data as needed.

## Run queries

To run the queries you need to first restore the (bundesliga) database.

```sh
mongorestore --drop --host=localhost --gzip --archive=dump/bundesliga-database.gz
```

Then you can run all queries by executing

```sh
node queries
```

You can also modify `queries/index.js` to just run some queries or copy the commands from the `queries/MongoShellQuery` folder and execude them in the mongo shell.
