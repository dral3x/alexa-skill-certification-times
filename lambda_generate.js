const AWS = require('aws-sdk');
const WebsiteGenerator = require('./src/exporters/website_generator');

const config = require('./src/conf');

exports.handler = (event, context, callback) => {

    console.log('Received event: '+JSON.stringify(event, null, 2));
    
    // Configure AWS services
    AWS.config.update({region: config.get('aws.region')});

    // Configure Generator
    let generator = new WebsiteGenerator(config);

    // Execute
    generator.generateSite((err) => {

        if (err) {
            callback(err);
        } else {
            callback(null, 'Site has been generated successfully.');
        }

    });

};