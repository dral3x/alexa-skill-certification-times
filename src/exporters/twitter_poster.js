const AWS = require('aws-sdk');
const Twitter = require('twit');
const Mustache  = require('mustache');
const moment = require('moment');

const formatter = require('../formatter');

class TwitterPoster {

    constructor(config) {
        this.table_daily = config.get('dynamodb.table_daily');
        this.twitter_config = config.get('twitter');

        this.message_with_data = 'Average certification time for {{date}}: {{average_days}} {{result_emoji}}. See trend on https://skillcertificationtimes.com and contribute with #skillcertificationtime or DM';
        this.message_without_data = 'No data for {{date}} 😧. You can contribute sharing your skill certification time with #skillcertificationtime or via DM';
    }

    postYesterdayMetrics(callback) {
        let date = moment(new Date()).subtract(1, 'days');
        
        this.postDailyMetrics(date, callback);
    }

    postDailyMetrics(date, callback) {

        this._getDailyAverage(date, (err, average, count) => {

            if (err) {
                console.error('Unable to fetch daily average: '+err, err);
                return callback(err);
            }

            this._postDailyAverage(date, average, count, (err, message) => {

                if (err) {
                    console.error('Unable to post daily average: '+err, err);
                    return callback(err);
                }

                callback(null, message);

            });
        });

    }

    _getDailyAverage(date, callback) {

        let db = new AWS.DynamoDB.DocumentClient();

        var params = {
            TableName: this.table_daily,
            Key: {
                'date': formatter.formatDate(date)
            }
        };

        db.get(params, function(err, data) {
            
            if (err) {
                console.error('Unable to read item. Error JSON:', JSON.stringify(err, null, 2));
                return callback(err);
            }

            // DEBUG
            console.log('GetItem succeeded:', JSON.stringify(data, null, 2));

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

        let template = count > 0 ? this.message_with_data : this.message_without_data;

        let message = Mustache.render(template, { 
            date: formatter.formatHumanDate(date), 
            average_days: formatter.formatHumanDuration(average),
            result_emoji: formatter.formatEmojiResult(average)
        });

        // DEBUG
        console.log('Posting message: '+message);

        //callback(null, message);
        var tw_client = new Twitter(this.twitter_config);
        var params = { 'status': message };

        tw_client.post('statuses/update', params, (err, data, response) => {
    
            if (err) {
                console.error('[ERROR] status code:' + err.statusCode + ' message: ' +err.message);
                return callback(err);
            }

            if (!response || response.statusCode != 200) {
                console.error('[ERROR] invalid response:' + JSON.stringify(response));
                return callback(err);
            }

            if (!data) {
                console.error('[ERROR] invalid data');
                return callback(err);
            }

            console.log('Getting '+data);

            callback(null, message)
        
        });
    }
}

module.exports = TwitterPoster;
