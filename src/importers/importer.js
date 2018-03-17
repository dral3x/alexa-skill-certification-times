const Twitter = require('twit');
const AWS = require('aws-sdk');
const async = require("async");

const Extractor = require('../extractor');
const formatter = require('../formatter');
const notifier = require('../notifier');

class Importer {

    constructor(config) {
        this.table = config.get('dynamodb.table_datapoints');
        this.topic = config.get("sns.topic_request_process");
        this.twitter_config = config.get("twitter");

        this.hashtag = '#skillcertificationtime';
    }

    importData(callback) {

        console.log("[ALL] Importing data");

        let importers = [ 
            this._importPublicTweets.bind(this),
            this._importDirectMessages.bind(this)
        ];

        async.parallel(importers, (err, results) => {

            if (err) {
                console.log("[ALL] Unable to import data: "+err);
                return callback(err);
            }

            console.log("[ALL] Import completed");
            console.log("[ALL] dates? "+results);

            let set = new Set();
            for (let result of results) {
                for (let date of result) {
                    set.add(date);
                }
            }

            let dates = Array.from(set);
            notifier.publish(this.topic, { "dates": dates }, (err) => {

                // Ignore any error. Just log it
                if (err) {
                    console.error("[ALL] Unable to publish on topic "+this.topic+": "+err);
                }

                callback(null, dates);
            });

        });
    }

    _importPublicTweets(callback) {

        console.log("[TWEETS] Importing data");
        
        async.waterfall([
            (cb) => cb(null, null),
            this._fetchLastData.bind(this),
            this._fetchPublicTweets.bind(this),
            this._processPublicTweets.bind(this)
        ], function (err, result) {
        
            if (err) {
                console.error('[TWEETS] Unable to process tweets: '+err);
                return callback(err);
            }

            console.log("[TWEETS] Import completed with "+result);
            callback(null, result);

        });

    }

    _importDirectMessages(callback) {

        console.log("[DM] Importing data");
        
        async.waterfall([
            (cb) => cb(null, null),
            this._fetchDirectMessages.bind(this),
            this._processDirectMessages.bind(this)
        ], function (err, result) {
        
            if (err) {
                console.error('[DM] Unable to process direct messages: '+err);
                return callback(err);
            }

            console.log('[DM] Import completed');
            callback(null, result);

        });

    }

    /* Handling Public Tweets */

    _fetchLastData(anything, callback) {

        // TODO
        callback(null, null);
  
    }

    _fetchPublicTweets(last_id, callback) {
        
        var tw_client = new Twitter(this.twitter_config);
        var params = { 'q': this.hashtag };
        if (last_id) {
            params["since_id"] = last_id;
        }

        tw_client.get('search/tweets', params, function (err, data, response) {
    
            if (err) {
                console.error('twitter status code:' + err.statusCode + ' message: ' +err.message, err);
                return callback(err);
            }

            if (!response || response.statusCode != 200) {
                console.error('twitter invalid response:' + JSON.stringify(response));
                return callback(err);
            }

            if (!data) {
                console.error('twitter invalid data');
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
            let created_at = new Date(status.created_at);
            let timestamp = formatter.formatDateTime(created_at);
            let date = formatter.formatDate(created_at);
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
        this._writeItems(items, function (err) {

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

        tw_client.get('direct_messages/events/list', params, function (err, data, response) {
    
            if (err) {
                console.error('twitter status code:' + err.statusCode + ' message: ' +err.message, err);
                return callback(err);
            }

            if (!response || response.statusCode != 200) {
                console.error('twitter invalid response:' + JSON.stringify(response));
                return callback(err);
            }

            if (!data) {
                console.error('twitter invalid data');
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
            let timestamp = formatter.formatDateTime(created_at);
            let date = Extractor.extractDate(text) || formatter.formatDate(created_at);
            
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
        this._writeItems(items, function (err) {

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

        let db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        db.batchWriteItem(params, function(err, data) {
            
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
