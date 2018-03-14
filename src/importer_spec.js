const fixtures  = require("../fixtures/fixtures");
const Importer  = require("./importer");
//const Twitter   = require('twit');

describe("Importer", () => {

    const config = fixtures.use("conf");
    const twitter = fixtures.use("twitter");
    const db = fixtures.use("dynamodb");

    describe("importData", () => {

        it("should work", (done) => {

            spyOn(twitter, "get").and.callFake(function(path, params, cb) {
                cb(null, {
                    statuses: [
                    ]
                }, {
                    statusCode: 200
                });
            });

            let importer = new Importer(config);

            importer.importData((error) => {

                expect(error).toBe(null);

                expect(twitter.get).toHaveBeenCalled();

                done();

            });

        });

    });
});
