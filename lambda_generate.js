const AWS 		= require('aws-sdk');
const Generator = require('./src/generator');

const config 	= require('./src/conf');

exports.handler = (event, context, callback) => {

	// Configure AWS services
	AWS.config.update({region: config.get("aws.region")});

	// Configure Generator
	let generator = new Generator(config);

	// Execute
    generator.generateSite((err) => {

    	if (err) {
			callback(err);
    	} else {
    		callback(null, 'Site has been generated successfully.');
		}

    });

};