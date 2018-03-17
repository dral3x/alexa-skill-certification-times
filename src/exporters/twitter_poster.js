const AWS = require('aws-sdk');
const Twitter = require('twit');
const Mustache  = require('mustache');
const moment = require('moment');

class TwitterPoster {

    constructor(config) {
        this.table_daily = config.get('dynamodb.table_daily');

        this.message_with_data = "Average certification time for {{today}}: {{average}} days. https://skillcertificationtimes.com . Contribute with #skillcertificationtimes or DM";
        this.message_without_data = "No data for {{today}}. You can contribute sharing certification time of your skills with #skillcertificationtimes or via DM";
    }

    postYesterdayMetrics(callback) {
        let date = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD", true);
        
        this.postDailyMetrics(date, callback);
    }

    postDailyMetrics(date, callback) {

        this._getDailyAverage(date, (err, average, count) => {

            if (err) {
                console.error("Unable to fetch daily average: "+err, err);
                return callback(err);
            }

            this._postDailyAverage(date, average, count, (err) => {

                if (err) {
                    console.error("Unable to post daily average: "+err, err);
                    return callback(err);
                }

                callback(null);

            });
        });

    }

    _getDailyAverage(date, callback) {

        let db = new AWS.DynamoDB.DocumentClient();

        var params = {
            TableName: this.table_daily,
            Key: {
                "date": date
            }
        };

        db.get(params, function(err, data) {
            
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return callback(err);
            }

            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));

            let avg = 0;
            let count = 0;
            if (data.Item) {
                avg = parseFloat(data.Item.avg);
                count = parseInt(data.Item.count);
            }

            callback(null, avg, count);

        });
    }

    _postDailyAverage(date, average, count, callback) {

        console.log("count:"+count);

        let template = count > 0 ? this.message_with_data : this.message_without_data;

        let message = Mustache.render(template, { 
            date: date, average: average 
        });

        console.log("Posting message: "+message);

        callback(null);
    }
}

module.exports = TwitterPoster;
