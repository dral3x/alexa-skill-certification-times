// Configure AWS services
const config = require('./src/conf');
const AWS = require('aws-sdk');
AWS.config.update({region: config.get("aws.region")});

const Importer = require('./src/importer');

exports.handler = (event, context, callback) => {
    
    new Importer().importData((err) => {

    	if (err) {
			callback(err);
    	} else {
    		callback(null, 'Data has been imported successfully.');
		}

    });

};