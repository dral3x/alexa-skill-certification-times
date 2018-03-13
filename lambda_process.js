const AWS = require('aws-sdk');
const Processor = require('./src/processor');

const config = require('./src/conf');

exports.handler = (event, context, callback) => {
    
    // Configure AWS services
    AWS.config.update({region: config.get("aws.region")});

    // Configure Processor
    let processor = new Processor(config);

    // Execute
    processor.generateStats((err) => {

        if (err) {
            callback(err);
        } else {
            callback(null, 'Statistics has been recalculated successfully.');
        }

    });

};