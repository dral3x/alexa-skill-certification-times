const AWS = require('aws-sdk');

const Data = require('./template_data');

class DataGenerator {

    constructor(config) {
        this.table = config.get('dynamodb.table_daily');
        this.bucket = config.get('s3.bucket_website');
    }

    generateDataModel(callback) {

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

}

module.exports = DataGenerator;
