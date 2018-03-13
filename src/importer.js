const Twitter 	= require('twit');
const AWS 		= require('aws-sdk');

const DateUtil 	= require('./date_util');

class Importer {

	constructor(config) {
        this.table = config.get('importer.table');
        this.hashtag = '#skillcertificationtime';
        this.db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        this.twitter_config = config.get("twitter");
    }

    importData(callback) {

    	this.fetchLastData((err, lastTweet) => {

    		if (err) {
    			console.log('Unable to fetch last tweet: '+err);
    			return callback(err);
    		}

    		this.fetchNewData(lastTweet != null ? lastTweet.id : null, (err, tweets) => {

    			if (err) {
    				console.log('Unable to fetch new tweets: '+err);
    				return callback(err);
    			}

    			this.processData(tweets, (err, data) => {

    				if (err) {
    					console.log('Unable to process tweets: '+err);
    					return callback(err);
    				}

    				console.log("Success!");
    				callback(null);

    			});

    		});
    	
    	});

	}

    fetchLastData(callback) {

    	// TODO
    	callback(null, null);
  
    }

    fetchNewData(last_id, callback) {
		
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

	processData(statuses, callback) {

		console.log('processing '+statuses.length+ ' tweets');

		// DEBUG
		//console.log('statuses: '+ JSON.stringify(statuses));

		var dates = new Set();
		var requests = [];

		for (var i = 0, len = statuses.length; i < len; i++) {
 			 var status = statuses[i];
	
			let id = status.id_str;
			let created_at = new Date(status.created_at); //TODO use DateUtil?
			let timestamp = DateUtil.formatDate(created_at, "YYYY-MM-DD HH:mm:ss", true);
			let date = DateUtil.formatDate(created_at, "YYYY-MM-DD", true);
			let text = status.text;
			let user = status.user.screen_name;

			console.log('[TWEET] id: '+ id + ' timestamp: '+ timestamp + ' text: '+ text);

			requests.push({
         		PutRequest: {
           			Item: {
             			"date": { "S": date },
						"timestamp": { "S": timestamp },
             			"id": { "S": id },
               			"user": { "S": user },
               			"text": { "S": text }
           			}
				}
       		});

       		dates.add(date);
		}

		if (requests.length == 0) {
			console.log("Nothing to import");
			return callback(null, []);
		}

		// Create the DynamoDB service object
		let tableRequests = {}
		tableRequests[this.table] = requests;
		
		var params = {
			RequestItems: tableRequests
		};

		this.db.batchWriteItem(params, function(err, data) {
  			if (err) {
    			console.log("Error", err);
    			callback(err);
  			} else {
    			console.log("Success", data);
    			callback(null, Array.from(dates));
  			}
		});
    }
}

module.exports = Importer;
