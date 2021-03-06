const Twitter = require('twit');
const AWS = require('aws-sdk');
const async = require("async");

const Extractor = require('../extractor');
const ItemFactory = require('../item_factory');
const formatter = require('../formatter');
const notifier = require('../notifier');

class Importer {

    constructor(config) {
        this.table = config.get('dynamodb.table_datapoints');
        this.table_state = config.get('dynamodb.table_state');
        this.topic = config.get("sns.topic_request_process");
        this.twitter_config = config.get("twitter");

        this.hashtag = '#skillcertificationtime';
        this.users_blacklist = [ "skillcerttimes", "973232735576829952" ];
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

            let set = new Set();
            for (let result of results) {
                for (let date of result) {
                    set.add(date);
                }
            }

            let dates = Array.from(set);
            console.log("[ALL] dates? "+dates);
            if (dates.length === 0) {
                return;
            }

            console.log("[ALL] Requesting processing for dates");
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
            this._fetchLastPublicTweetId.bind(this),
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
            this._fetchLastDirectMessageTimestamp.bind(this),
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

    _fetchLastPublicTweetId(anything, callback) {

        this._readState("importer_twitter_public_tweets_last_id", (err, state) => {

            if (err) {
                callback(err);
            } else {
                console.log('[TWEETS] last tweet id: ' + state);
                callback(null, state);
            }

        });
    }

    _fetchPublicTweets(last_id, callback) {

        var tw_client = new Twitter(this.twitter_config);
        var params = { 'q': this.hashtag, 'result_type': 'recent', 'count': 100 };
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

            console.log('[TWEETS] Processing response 200');

            callback(null, data.statuses)

        });
    }

    _processPublicTweets(statuses, callback) {

        console.log('[TWEETS] processing '+statuses.length+ ' tweets');

        // DEBUG
        //console.log('statuses: '+ JSON.stringify(statuses));

        let factory = new ItemFactory();
        var dates = new Set();
        var items = [];

        for (var i = 0, len = statuses.length; i < len; i++) {
            var status = statuses[i];

            let id = status.id_str;
            let created_at = new Date(status.created_at);
            let timestamp = formatter.formatDateTime(created_at);
            let text = status.text;
            let user = status.user.screen_name;

            console.log('[TWEET] id: '+ id + ' timestamp: '+ timestamp + ' text: '+ text);

            if (this.users_blacklist.indexOf(user) >= 0) {
                console.log('[TWEET] user '+ user + ' is blacklisted');
                continue;
            }

            items.push(factory.itemFromTweet(created_at, user, id, created_at, text));

            dates.add(formatter.formatDate(created_at));
        }

        if (items.length == 0) {
            console.log("Nothing to import");

            if (statuses.length == 0) {
                callback(null, []);
            } else {
                this._writeState("importer_twitter_public_tweets_last_id", statuses[0].id_str, (err) => {

                    callback(null, []);

                });
            }
            return;
        }

        // Write data to db
        this._writeItems(items, (err) => {

            if (err) {
                return callback(err);
            }

            this._writeState("importer_twitter_public_tweets_last_id", statuses[0].id_str, (err) => {

                callback(null, Array.from(dates));

            });

        });
    }

    /* Handling Direct Messages */

    _fetchLastDirectMessageTimestamp(anything, callback) {

        this._readState("importer_twitter_dm_last_timestamp", (err, state) => {

            callback(null, state);

        });
    }

    _fetchDirectMessages(last_timestamp, callback) {

        var tw_client = new Twitter(this.twitter_config);
        var params = {};

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

            if (!last_timestamp) {
                return callback(null, data.events);
            }

            // Filter out messages older than last_timestamp
            var events = [];
            for (let event of data.events) {
                if (event.created_timestamp > last_timestamp) {
                    events.push(event);
                }
            }

            console.log('[DM] Found '+events.length+' messages to process');

            callback(null, events);

        });
    }

    _processDirectMessages(messages, callback) {

        console.log('processing '+messages.length+ ' messages');

        let factory = new ItemFactory();
        var dates = new Set();
        var items = [];

        for (var i = 0, len = messages.length; i < len; i++) {
            var message = messages[i];

            let created_at = new Date(parseInt(message.created_timestamp, 10));
            let text = message.message_create.message_data.text;
            let user = message.message_create.sender_id;
            let timestamp = formatter.formatDateTime(created_at);
            let date = Extractor.extractDate(text) || created_at;

            console.log('[DM] from: '+ user + ' timestamp: '+ timestamp + ' text: '+ text);

            if (this.users_blacklist.indexOf(user) >= 0) {
                console.log('[DM] user '+ user + ' is blacklisted');
                continue;
            }

            items.push(factory.itemFromDM(created_at, user, date, text));

            dates.add(formatter.formatDate(date));
        }

        if (items.length == 0) {
            console.log("Nothing to import");

            if (messages.length > 0) {
                this._writeState("importer_twitter_dm_last_timestamp", messages[0].created_timestamp, (err, state) => {

                    callback(null, []);

                });
            } else {
                callback(null, []);
            }
            return;
        }

        // Write data to db
        this._writeItems(items, (err) => {

            if (err) {
                return callback(err);
            }

            this._writeState("importer_twitter_dm_last_timestamp", messages[0].created_timestamp, (err, state) => {

                callback(null, Array.from(dates));

            });

        });
    }

    /* Common */

    _writeItems(items, callback) {

        var requests = [];
        for (var i = 0, len = items.length; i < len; i++) {
            requests.push({
                PutRequest: { Item: items[i] },
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

    _readState(key, callback) {

        let db = new AWS.DynamoDB.DocumentClient();

        var params = {
            TableName: this.table_state,
            Key: {
                "property": key
            }
        };

        db.get(params, function(err, data) {

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return callback(err);
            }

            if (data.Item) {
                callback(null, data.Item.value);
            } else {
                callback(null, null);
            }

        });

    }

    _writeState(key, state, callback) {

        let db = new AWS.DynamoDB.DocumentClient();

        var params = {
            TableName: this.table_state,
            Item: {
                "property": key,
                "value": state
            }
        };

        db.put(params, function(err, data) {

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                return callback(err);
            }

            // DEBUG
            console.log("PutItem succeeded:", JSON.stringify(data, null, 2));

            callback(null, data.Item);

        });
    }

}

module.exports = Importer;
