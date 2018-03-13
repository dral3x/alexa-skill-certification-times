const AWS 		= require('aws-sdk');
const Mustache	= require('mustache');
const DateUtil 	= require('./date_util');

class Generator {

	constructor(config) {
        this.db 	= new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        this.table 	= config.get('generator.table');
        this.bucket = config.get('generator.bucket');
    }

    generateSite(callback) {

    	this._fetchData((err, results) => {

    		if (err) {
    			console.log('Unable to fetch data: '+err);
    			return callback(err);
    		}

    		this._exportPages(results, (err, results) => {

    			if (err) {
    				console.log('Unable to export pages: '+err);
    				return callback(err);
    			}

    			console.log("Success!");
    			callback(null);

    		});
    	
    	});

	}

    _fetchData(callback) {

    	// TODO
    	let data = {
    		"last_7_days": [
    			{ "date": "2018-03-12", "count": 1 }, 
    			{ "date": "2018-03-11", "count": 2 }, 
    			{ "date": "2018-03-10", "count": 3 }, 
    			{ "date": "2018-03-09", "count": 4 }, 
    			{ "date": "2018-03-08", "count": 5 }, 
    			{ "date": "2018-03-07", "count": 6 }, 
    			{ "date": "2018-03-06", "count": 7 }
    		]
    	};

    	callback(null, data);

    }

    _exportPages(data, callback) {
		
		let s3 = new AWS.S3();
		
		// Read template from S2
		let getParams = { Bucket: this.bucket, Key: "templates/index.html" };
		s3.getObject(getParams, (err, file) => {
  			
  			if (err) {
  				console.log(err, err.stack); // an error occurred
  				return callback(err);
  			}    

  		 	// Inject data into template
  		 	var template = file.Body.toString();
  		 	console.log("TEMPLATE: "+template);
  			var rendered = this._generatePageIndex(template, data);
  			console.log("RENDERED: "+rendered);

  			// Write final file to S3
  			let putParams = { Bucket: this.bucket, Key: "public/index.html", Body: rendered };
     		s3.putObject(putParams, function(err, pdata) {

         		if (err) {
		             console.log("Unable to write file to S3", err);
		             return callback(err);
				}

             	console.log("Successfully uploaded data to S3: "+pdata);
             	callback(null, "YEAH");

	      	});
  		 	
		});
    }

    _generatePageIndex(template, data) {

  		var rendered = Mustache.render(template, data);

  		return rendered;
    }
}

module.exports = Generator;
