const AWS       = require('aws-sdk');

const DateUtil  = require('../date_util');
const Extractor = require('../extractor');

const notifier = require('../notifier');

class Processor {

    constructor(config) {
        this.table_source = config.get('processor.table_source');
        this.table_daily = config.get('processor.table_daily');
        this.topic = config.get("processor.topic");
    }

    generateStats(dates, callback) {

        if (!dates || dates.length == 0) {
            // Return without notify topic
            return callback(null, "Nothing to process");
        }

        this._processDates(dates, (err) => {

            // Handle failure
            if (err) {
                return callback(err);
            }

            // Handle success
            notifier.publish(this.topic, { "dates": dates }, (err) => {
                callback(null, "Processed "+dates.length+" dates");
            });

        })
    }

    _processDates(dates, callback) {

        if (dates.length == 0) {
            return callback(null);
        }

        this._processDate(dates[0], (err) => {

            if (err) {
                return callback(err);
            }

            this._processDates(dates.slice(1), callback);
        })

    }

    _processDate(date, callback) {

        console.log("Processing data for date "+date);

        this._fetchDailyData(date, (err, values) => {

            if (err) {
                return callback(err);
            }

            this._generateDailyStats(date, values, (err) => {

                if (err) {
                    return callback(err);
                }

                callback(null);

            });

        });

    }

    _fetchDailyData(date, callback) {

        let db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        var numbers = [];

        var params = {
            TableName: this.table_source,
            ProjectionExpression: "#dt, #ts, #tx",
            FilterExpression: "#dt = :selection",
            ExpressionAttributeNames: {
                "#ts": "timestamp",
                "#dt": "date",
                "#tx": "text",
            },
            ExpressionAttributeValues: {
                ":selection": { 'S': date }
            }
        };

        function onScan(err, data) {
            
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                return callback(err);
            }

            // Check all tweets

            data.Items.forEach(function(tweet) {
                console.log(tweet.timestamp['S'] + ": ", tweet.text['S']);

                let value = Extractor.readDays(tweet.text['S']);
                if (value) {
                    numbers.push(value);
                }
            });

            // continue scanning when LastEvaluatedKey is defined

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                db.scan(params, onScan);
            } else {

                // All tweets has been parsed. 
                // Returns values
                callback(null, numbers);
            }
        }

        db.scan(params, onScan);
    }

    _generateDailyStats(date, values, callback) {

        console.log("values "+values);

        if (values.length == 0) {
            console.log("day "+date+" has no data");
            return callback(null);
        }

        var sum = 0;
        values.forEach(function(value) {
            sum += value;
        });

        let avg = sum / values.length;
        console.log("day "+date+" avg: "+avg);

        var params = {
            TableName: this.table_daily,
            Item: {
                "date": date,
                "count": values.length,
                "avg": avg
            }
        };

        let db = new AWS.DynamoDB.DocumentClient();
        db.put(params, (err, data) => {

            if (err) {
                console.log("Unable to insert daily data "+date+": "+JSON.stringify(err, null, 2));
                return callback(err);
            }

            callback(null);
        });
        
    }
}

module.exports = Processor;
