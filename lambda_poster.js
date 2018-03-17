const AWS = require('aws-sdk');
const TwitterPoster = require('./src/exporters/twitter_poster');

const config = require('./src/conf');

exports.handler = (event, context, callback) => {

    // Configure AWS services
    AWS.config.update({region: config.get("aws.region")});

    // Configure Generator
    let exporter = new TwitterPoster(config);

    // Execute
    exporter.postYesterdayMetrics((err) => {

        if (err) {
            callback(err);
        } else {
            callback(null, 'Site has been generated successfully.');
        }

    });

};