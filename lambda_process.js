const AWS = require('aws-sdk');
const Processor = require('./src/processor/processor');

const config = require('./src/conf');


function extractDatesFromEvent(event) {

    let message = event.Records[0].Sns.Message;
    if (!message) {
        return [];
    }
    let dates = JSON.parse(message).dates;
    if (!dates) {
        return [];
    }

    return dates;
}

exports.handler = (event, context, callback) => {
    
    console.log('Received event: '+JSON.stringify(event, null, 2));

    // Configure AWS services
    AWS.config.update({region: config.get('aws.region')});

    // Configure Processor
    let processor = new Processor(config);

    // Execute
    processor.generateStats(extractDatesFromEvent(event), (err) => {

        if (err) {
            callback(err);
        } else {
            callback(null, 'Statistics has been recalculated successfully.');
        }

    });

};