const fixtures  = require("../../fixtures/fixtures");
const Importer  = require("./importer");

describe("Importer", () => {

    const config = fixtures.use("conf");
    const twitter = fixtures.use("twitter");
    const dynamodb = fixtures.use("dynamodb");
    const sns = fixtures.use("sns");

    it("should do nothing then no new tweets have been found", (done) => {

        spyOn(twitter, "get").and.callFake(function(path, params, cb) {
            cb(null, {
                statuses: [
                ]
            }, {
                statusCode: 200
            });
        });
        spyOn(dynamodb, "batchWriteItem");

        let importer = new Importer(config);

        importer.importData((error) => {

            expect(error).toBe(null);

            expect(twitter.get).toHaveBeenCalled();
            expect(dynamodb.batchWriteItem).not.toHaveBeenCalled();

            done();

        });

    });

    it("should fetch new tweets from Twitter", (done) => {

        spyOn(twitter, "get").and.callFake(function(path, params, cb) {
            cb(null, {
                statuses: [{
                "created_at": "Sun Mar 11 07:59:43 +0000 2018",
                "id_str": "972743858927828992",
                "text": "Blablabla tooks 5 days to be certified #skillcertifiationtime",
                "user": {
                    "id_str": "942723802768773120",
                    "screen_name": "Tom",
                    }
                }]
            }, {
                statusCode: 200
            });
        });

        spyOn(dynamodb, "batchWriteItem").and.callFake(function(params, cb) {
            cb(null, "Ok!");
        });

        let importer = new Importer(config);

        importer.importData((error, dates) => {

            expect(twitter.get).toHaveBeenCalled();
            
            let params = twitter.get.calls.mostRecent().args;
            expect(params[0]).toEqual("search/tweets");
            expect(params[1]).toEqual({ q: "#skillcertificationtime" });

            done();

        });

    });

    it("should returns processed dates", (done) => {

        spyOn(twitter, "get").and.callFake(function(path, params, cb) {
            cb(null, {
                statuses: [{
                "created_at": "Sun Mar 11 07:59:43 +0000 2018",
                "id_str": "972743858927828992",
                "text": "Blablabla tooks 5 days to be certified #skillcertifiationtime",
                "user": {
                    "id_str": "942723802768773120",
                    "screen_name": "Tom",
                    }
                }]
            }, {
                statusCode: 200
            });
        });

        spyOn(dynamodb, "batchWriteItem").and.callFake(function(params, cb) {
            cb(null, "Ok!");
        });

        let importer = new Importer(config);

        importer.importData((error, dates) => {

            expect(error).toBe(null);
            expect(dates).toEqual(["2018-03-11"])

            done();

        });

    });

    it("should add new entry to db", (done) => {

        spyOn(twitter, "get").and.callFake(function(path, params, cb) {
            cb(null, {
                statuses: [{
                "created_at": "Sun Mar 11 07:59:43 +0000 2018",
                "id_str": "972743858927828992",
                "text": "Blablabla tooks 5 days to be certified #skillcertifiationtime",
                "user": {
                    "id_str": "942723802768773120",
                    "screen_name": "Tom",
                    }
                }]
            }, {
                statusCode: 200
            });
        });

        spyOn(dynamodb, "batchWriteItem").and.callFake(function(params, cb) {
            cb(null, "Ok!");
        });

        let importer = new Importer(config);

        importer.importData((error, dates) => {

            expect(dynamodb.batchWriteItem).toHaveBeenCalled();

            let params = dynamodb.batchWriteItem.calls.mostRecent().args[0];
            expect(params.RequestItems[config.get("dynamodb.table_datapoints")].length).toEqual(1);

            done();

        });

    });

});
