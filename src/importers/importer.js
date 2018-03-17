const Twitter = require('twit');
const AWS = require('aws-sdk');

const DateUtil = require('../date_util');
const Extractor = require('../extractor');
const notifier = require('../notifier');

class Importer {

    constructor(config) {
        this.table = config.get('importer.table');
        this.hashtag = '#skillcertificationtime';
        this.db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        this.twitter_config = config.get("twitter");
        this.topic = config.get("importer.topic");
    }

    importData(callback) {

        /*this._fetchDirectMessages(null, (err, messages) => {

            if (err) {
                console.log('Unable to fetch direct messages: '+err);
                return callback(err);
            }

            this._processDirectMessages(messages, (err, dates) => {
                
                if (err) {
                    console.log('Unable to process direct messages: '+err);
                    return callback(err);
                }

                callback(null, dates);

            });

        });*/

        this._fetchLastData((err, lastTweet) => {

            if (err) {
                console.log('Unable to fetch last tweet: '+err);
                return callback(err);
            }

            this._fetchPublicTweets(lastTweet != null ? lastTweet.id : null, (err, tweets) => {

                if (err) {
                    console.log('Unable to fetch new tweets: '+err);
                    return callback(err);
                }

                this._processPublicTweets(tweets, (err, dates) => {

                    if (err) {
                        console.log('Unable to process tweets: '+err);
                        return callback(err);
                    }

                    console.log("Success!");

                    notifier.publish(this.topic, { "dates": dates }, (err) => {
                        callback(null, dates);
                    });

                });

            });

        });
    }

    /* Handling Public Tweets */

    _fetchLastData(callback) {

        // TODO
        callback(null, null);
  
    }

    _fetchPublicTweets(last_id, callback) {
        
        var tw_client = new Twitter(this.twitter_config);
        var params = { 'q': this.hashtag };
        if (last_id) {
            params["since_id"] = last_id;
        }

        tw_client.get('search/tweets', params, (err, data, response) => {
    
            if (err) {
                console.log('[ERROR] status code:' + err.statusCode + ' message: ' +err.message);
                return callback(err);
            }

            if (!response || response.statusCode != 200) {
                console.log('[ERROR] invalid response:' + JSON.stringify(response));
                return callback(err);
            }

            if (!data) {
                console.log('[ERROR] invalid data');
                return callback(err);
            }

            console.log('Processing response 200');

            callback(null, data.statuses)
        
        });
    }

    _processPublicTweets(statuses, callback) {

        console.log('processing '+statuses.length+ ' tweets');

        // DEBUG
        //console.log('statuses: '+ JSON.stringify(statuses));

        var dates = new Set();
        var items = [];

        for (var i = 0, len = statuses.length; i < len; i++) {
            var status = statuses[i];
    
            let id = status.id_str;
            let created_at = new Date(status.created_at); //TODO use DateUtil?
            let timestamp = DateUtil.formatDate(created_at, "YYYY-MM-DD HH:mm:ss", true);
            let date = DateUtil.formatDate(created_at, "YYYY-MM-DD", true);
            let text = status.text;
            let user = status.user.screen_name;

            console.log('[TWEET] id: '+ id + ' timestamp: '+ timestamp + ' text: '+ text);

            items.push({
                "type": { "S": "PUBLIC_TWEET" },
                "date": { "S": date },
                "timestamp": { "S": timestamp },
                "id": { "S": id },
                "user": { "S": user },
                "text": { "S": text }
            });

            dates.add(date);
        }

        if (items.length == 0) {
            console.log("Nothing to import");
            return callback(null, []);
        }

        // Write data to db
        this._writeItems(items, (err) => {

            if (err) {
                return callback(err);
            }

            callback(null, Array.from(dates));
        });
    }

    /* Handling Direct Messages */

    _fetchDirectMessages(last_cursor, callback) {
        
        var tw_client = new Twitter(this.twitter_config);
        var params = {};
        if (last_cursor) {
            params["cursor"] = last_cursor;
        }

        tw_client.get('direct_messages/events/list', params, (err, data, response) => {
    
            if (err) {
                console.log('[ERROR] status code:' + err.statusCode + ' message: ' +err.message);
                return callback(err);
            }

            if (!response || response.statusCode != 200) {
                console.log('[ERROR] invalid response:' + JSON.stringify(response));
                return callback(err);
            }

            if (!data) {
                console.log('[ERROR] invalid data');
                return callback(err);
            }

            //console.log('Got events '+JSON.stringify(data));
            //if (data.next_cursor) {
            //    console.log('Got next_cursor '+data.next_cursor);
            //}

            callback(null, data.events);
        });
    }

    _processDirectMessages(messages, callback) {

        console.log('processing '+messages.length+ ' messages');

        var dates = new Set();
        var items = [];

        for (var i = 0, len = messages.length; i < len; i++) {
            var message = messages[i];
    
            let created_at = new Date(parseInt(message.created_timestamp, 10));
            let text = message.message_create.message_data.text;
            let user = message.message_create.sender_id;
            let timestamp = DateUtil.formatDate(created_at, "YYYY-MM-DD HH:mm:ss", true);
            let date = Extractor.extractDate(text) || DateUtil.formatDate(created_at, "YYYY-MM-DD", true);
            
            console.log('[DM] from: '+ user + ' timestamp: '+ timestamp + ' text: '+ text);

            items.push({
                "type": { "S": "DIRECT_MESSAGE" },
                "date": { "S": date },
                "timestamp": { "S": timestamp },
                "user": { "S": user },
                "text": { "S": text }
            });

            dates.add(date);
        }

        if (items.length == 0) {
            console.log("Nothing to import");
            return callback(null, []);
        }

        // Write data to db
        this._writeItems(items, (err) => {

            if (err) {
                return callback(err);
            }

            callback(null, Array.from(dates));
        });
    }

    /* Common */

    _writeItems(items, callback) {

        var requests = [];
        for (var i = 0, len = items.length; i < len; i++) {
            requests.push({
                PutRequest: { Item: items[i] }
            })
        }

        let tableRequests = {}
        tableRequests[this.table] = requests;
        
        var params = { RequestItems: tableRequests };

        this.db.batchWriteItem(params, function(err, data) {
            
            if (err) {
                console.log("Error", err);
                callback(err);
            } else {
                console.log("Success", data);
                callback(null);
            }
        });
    }
    
}

module.exports = Importer;
