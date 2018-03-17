const fixtures  = require("../../fixtures/fixtures");
const Importer  = require("./importer");

describe("Importer", () => {

    const config = fixtures.use("conf");
    const twitter = fixtures.use("twitter");
    const dynamodb = fixtures.use("dynamodb");
    const sns = fixtures.use("sns");

    describe("public tweets", () => {

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

            importer._importPublicTweets((error) => {

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

            importer._importPublicTweets((error, dates) => {

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

            importer._importPublicTweets((error, dates) => {

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

            importer._importPublicTweets((error, dates) => {

                expect(dynamodb.batchWriteItem).toHaveBeenCalled();

                let params = dynamodb.batchWriteItem.calls.mostRecent().args[0];
                expect(params.RequestItems[config.get("dynamodb.table_datapoints")].length).toEqual(1);

                done();

            });

        });

    });

    describe("Import All Data", () => {

        it("should import both PUBLIC_TWEETS and DIRECT_MESSAGES", (done) => {

            spyOn(twitter, "get").and.callFake(function(path, params, cb) {
                
                if (path == "search/tweets") {
                    return cb(null, {
                        statuses: [{
                            "created_at": "Sun Mar 11 07:59:43 +0000 2018",
                            "id_str": "972743858927828992",
                            "text": "Blablabla tooks 5 days to be certified #skillcertifiationtime",
                            "user": {
                                "id_str": "942723802768773120",
                                "screen_name": "Tom",
                            }
                        }]
                    }, { statusCode: 200 });
                }

                if (path == "direct_messages/events/list") {
                    return cb(null, {
                        events: [{
                            "created_timestamp": "1520936585337",
                            "message_create": { 
                                "message_data": { 
                                    "text": "5 days"
                                },
                                "sender_id": "942723802768773120"
                            }
                        }]
                    }, { statusCode: 200 });
                }

                cb(new Error());
            });

            spyOn(dynamodb, "batchWriteItem").and.callFake(function(params, cb) {
                cb(null, "Ok!");
            });

            let importer = new Importer(config);

            importer.importData((error, dates) => {

                expect(error).toBe(null);
                expect(dates).toEqual([ '2018-03-11', '2018-03-13']);

                done();

            });

        });
    });

});
