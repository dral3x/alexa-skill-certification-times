const AWS = require('aws-sdk');
const Importer = require('./src/importers/importer');

const config = require('./src/conf');

exports.handler = (event, context, callback) => {
    
    console.log('Received event: '+JSON.stringify(event, null, 2));
    
    // Configure AWS services
    AWS.config.update({region: config.get('aws.region')});

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