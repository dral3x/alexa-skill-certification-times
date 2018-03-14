const AWS       = require("aws-sdk");
const Twitter   = require('twit');
const conf      = require("../src/conf");

const fixtures   = {};

fixtures.conf = {
    use: function() {
       return conf;
    }
};

fixtures.dynamodb = {
    use: () => {

        // default behavior: error
        var db = { 
            batchWriteItem: (params, callback) => { callback("Mock error"); },
            scan: (params, callback) => { callback("Mock error"); },
            update: (params, callback) => { callback("Mock error"); },
            put: (params, callback) => { callback("Mock error"); }, 
        };

        beforeEach(() => {

            spyOn(AWS.DynamoDB, "DocumentClient").and.callFake(() => {
                return db;
            });
            spyOn(AWS, "DynamoDB").and.callFake(() => {
                return db;
            });

        });

        afterEach(() => {

        });

        return db;
    }
};

fixtures.twitter = {
    use: () => {
        
        // default behavior: success
        var client = { 
            get: (path, params, callback) => { callback("Mock error"); },
        };

        beforeEach(() => {

            spyOn(Twitter.prototype, "get").and.callFake((path, params, cb) => {
                return client.get(path, params, cb);
            });

        });

        afterEach(() => {

        });

        return client;
    }
};

module.exports.use = function(fixture) {
    if (fixtures[fixture] && fixtures[fixture].use) {
        return fixtures[fixture].use();
    }
};
