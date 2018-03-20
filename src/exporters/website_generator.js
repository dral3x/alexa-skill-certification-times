const AWS       = require('aws-sdk');
const Mustache  = require('mustache');
const moment    = require('moment');
const async     = require("async");

const DateUtil  = require('../date_util');
const Data      = require('./template_data');

class WebsiteGenerator {

    constructor(config) {
        this.table = config.get('dynamodb.table_daily');
        this.bucket = config.get('s3.bucket_website');
    }

    generateSite(callback) {

        this._generateDataModel((err, data) => {

            if (err) {
                console.log('Unable to fetch data: '+err);
                return callback(err);
            }

            this._exportPages(data, (err, results) => {

                if (err) {
                    console.log('Unable to export pages: '+err);
                    return callback(err);
                }

                console.log("Success!");
                callback(null, "Website pages updated!");

            });

        });

    }

    _generateDataModel(callback) {

        let db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
        
        var dataModel = new Data(new Date());

        var params = {
            TableName: this.table,
            ProjectionExpression: "#fdate, #favg, #fcount",
            FilterExpression: "#fdate BETWEEN :dt_first AND :dt_last",
            ExpressionAttributeNames: {
                "#fdate": "date",
                "#fcount": "count",
                "#favg": "avg"
            },
            ExpressionAttributeValues: {
                ":dt_first": { 'S': dataModel.startDate() },
                ":dt_last": { 'S': dataModel.endDate() }
            }
        };

        function onScan(err, data) {
            
            if (err) {
                console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
                return callback(err);
            }

            // Add all results to data

            data.Items.forEach(function(item) {
                dataModel.addEntry(item.date['S'], parseFloat(item.avg['N']), parseInt(item.count['N']));
            });

            // continue scanning when LastEvaluatedKey is defined

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                db.scan(params, onScan);
            } else {

                console.log("Scan completed: "+dataModel);
                // All tweets has been parsed. 
                // Returns values
                callback(null, dataModel);
            }
        }

        db.scan(params, onScan);
    }

    _exportPages(data, callback) {

        let files = [ "index.html", "contribute.html" ];
        let metrics = data.export();
        let s3 = new AWS.S3();

        let processes = files.map((file) => (callback) => {
            return this._exportPage(s3, file, metrics, callback);
        });

        async.parallel(processes, (err, results) => {

            if (err) {
                return callback(err);
            }

            callback(null, "All files generated");
        });
    }

    _exportPage(s3, file, metrics, callback) {

        console.log("Fetching "+file);

        let templateFile = "templates/"+file;
        let outputFile = "public/"+file;

        // Read template from S3
        let getParams = { Bucket: this.bucket, Key: templateFile };
        s3.getObject(getParams, (err, file) => {

            if (err) {
                console.log(err, err.stack); // an error occurred
                return callback(err);
            }    

            // Inject data into template
            var template = file.Body.toString();
            //console.log("METRICS: "+JSON.stringify(metrics, null, 2));
            var rendered = this._injectDataIntoTemplate(template, metrics);
            //console.log("RENDERED: "+rendered);

            // Write final file to S3
            let putParams = { 
                Bucket: this.bucket, 
                Key: outputFile, 
                ContentType: 'text/html',
                Expires: Math.floor(new Date().getTime()/1000) + 60*60,
                Body: rendered
            };
            s3.putObject(putParams, function(err, pdata) {

                if (err) {
                    console.log("Unable to write file to S3", err);
                    return callback(err);
                }

                console.log("Successfully uploaded file to S3: "+pdata);
                callback(null, "YEAH");

            });
        
        });
    }

    _injectDataIntoTemplate(template, data) {

        return Mustache.render(template, data);
    }
}

module.exports = WebsiteGenerator;
