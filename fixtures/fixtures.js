const AWS           = require("aws-sdk");
const conf          = require("../src/conf");

const fixtures   = {};

fixtures.conf = {
    use: function() {
       return conf;
    }
};

fixtures.dynamodb = {
    use: () => {

        // default behavior: success
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

module.exports.use = function(fixture) {
    if (fixtures[fixture] && fixtures[fixture].use) {
        return fixtures[fixture].use();
    }
};
