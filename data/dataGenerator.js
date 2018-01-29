//So far, I am just testing Tutorial content.

'use strict';

const monk = require('monk');
const config = require('config');

const createServer = require('./src/server');

const connection = config.get('db.connection');
monk(connection)
    .then(db => {
    	console.log('Connected to db:', db._connectionURI);
    	var insertDocuments = function (db, callback) {
    		// Get the documents collection
    		var collection = db.collection('documents');
    		// Insert some documents
    		collection.insertMany([
			  { a: 1 }, { a: 2 }, { a: 3 }
    		], function (err, result) {
    			assert.equal(err, null);
    			assert.equal(3, result.result.n);
    			assert.equal(3, result.ops.length);
    			console.log("Inserted 3 documents into the collection");
    			callback(result);
    		});
    	}
    })
    .catch(err => {
    	console.log('Connection to db failed:', err.message);
    	process.exit(1);
    });


