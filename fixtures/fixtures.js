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
            batchWriteItem: (params, callback) => { callback("DynamoDB batchWriteItem mock error"); },
            scan: (params, callback) => { callback("DynamoDB scan mock error"); },
            update: (params, callback) => { callback("DynamoDB update mock error"); },
            put: (params, callback) => { callback("DynamoDB put mock error"); }, 
            get: (params, callback) => { callback("DynamoDB get mock error"); }, 
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
            get: (path, params, callback) => { callback("Twitter get mock error"); },
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

fixtures.sns = {
    use: () => {
        
        // default behavior: success
        var client = { 
            publish: (params, callback) => { callback("SNS publish mock error"); },
        };

        beforeEach(() => {

            spyOn(AWS, "SNS").and.callFake((path, params, cb) => {
                return client;
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
