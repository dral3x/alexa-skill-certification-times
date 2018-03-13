// Configure AWS services
const config = require('./src/conf');
const AWS = require('aws-sdk');
AWS.config.update({region: config.get("aws.region")});

const Processor = require('./src/processor');

exports.handler = (event, context, callback) => {
    
    new Processor().generateStats((err) => {

    	if (err) {
			callback(err);
    	} else {
    		callback(null, 'Statistics has been recalculated successfully.');
		}

    });

};