const AWS = require('aws-sdk');
const Adapter = require('ask-sdk-dynamodb-persistence-adapter');

const DataGenerator = require('../exporters/data_generator');
const ItemFactory = require('../item_factory');

class Repository {

    constructor(attributesManager, config) {
        this.attributesManager = attributesManager;
        this.entries = config.get('dynamodb.table_datapoints');
        this.daily = config.get('dynamodb.table_daily');
        this.generator = new DataGenerator(config);
    }

    getCurrentAverage() {

        return new Promise(((resolve, reject) => {

            this.generator.generateDataModel((error, data) => {

                if (error) {
                    console.error('Unable to read item. Error JSON:', JSON.stringify(error, null, 2));
                    return reject(error)
                }

                resolve(data.export().overall);
            
            });

        }));
    }

    recordNewEntry(user, date, duration) {

        return new Promise((resolve, reject) => {

            console.log(`Recording new entry: ${duration}`);

            let db = new AWS.DynamoDB({ apiVersion: '2012-10-08' });
            let factory = new ItemFactory();

            var params = {
                TableName: this.entries,
                Item: factory.itemFromAlexa(new Date(), user, date, duration)
            };

            db.putItem(params, function(err, data) {
            
                if (err) {
                    console.log('Error', err);
                    return reject(err);
                }

                console.log('Success', data);
                resolve(null);
            });

        }).then(() => {

            // Update user state
            return new Promise( (resolve, reject) => {
                
                this.attributesManager.getPersistentAttributes()
                .then((attributes) => {

                    attributes['date_last_entry'] = date;
                    if (!attributes['total_entries']) {
                        attributes['total_entries'] = 0;
                    }
                    attributes['total_entries'] = attributes['total_entries'] + 1;
                    this.attributesManager.setPersistentAttributes(attributes);

                    resolve(this.attributesManager.savePersistentAttributes());
                })
                .catch((error) => {
                    reject(error);
                })
            });

        }, (err) => {

            console.log(err);

        });
    }

    // return if user has already record an entry for today.
    canRecordEntry(date) {

        //TODO use attributesManager.getPersistentAttributes()
        //let lastDate = this.state['date_last_entry'];
        //return !lastDate || date != lastDate;
        return true;
    }
}

module.exports = Repository;
