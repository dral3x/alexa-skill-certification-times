const AWS = require('aws-sdk');
const Importer = require('./src/importer');

const config = require('./src/conf');

exports.handler = (event, context, callback) => {
    
    // Configure AWS services
	AWS.config.update({region: config.get("aws.region")});

	// Configure Importer
	let importer = new Importer(config);

	// Execute
    importer.importData((err) => {

    	if (err) {
			callback(err);
    	} else {
    		callback(null, 'Data has been imported successfully.');
		}

    });

};