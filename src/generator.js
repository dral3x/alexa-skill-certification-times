const AWS       = require('aws-sdk');
const Mustache  = require('mustache');
const DateUtil  = require('./date_util');
const Data      = require('./template_data');

class Generator {

    constructor(config) {
        this.table = config.get('generator.table');
        this.bucket = config.get('generator.bucket');
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
                dataModel.addEntry(item.date['S'], item.avg['N'], item.count['N']);
            });

            // continue scanning when LastEvaluatedKey is defined

            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                db.scan(params, onScan);
            } else {

                // All tweets has been parsed. 
                // Returns values
                callback(null, dataModel);
            }
        }

        db.scan(params, onScan);
    }

    _exportPages(data, callback) {

        let s3 = new AWS.S3();

        // Read template from S3
        let getParams = { Bucket: this.bucket, Key: "templates/index.html" };
        s3.getObject(getParams, (err, file) => {

            if (err) {
                console.log(err, err.stack); // an error occurred
                return callback(err);
            }    

            // Inject data into template
            var template = file.Body.toString();
            console.log("TEMPLATE: "+template);
            var rendered = this._injectDataIntoTemplate(template, data.export());
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

    _injectDataIntoTemplate(template, data) {

        var rendered = Mustache.render(template, data);

        return rendered;
    }
}

module.exports = Generator;
