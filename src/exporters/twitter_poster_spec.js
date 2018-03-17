const fixtures = require("../../fixtures/fixtures");
const TwitterPoster = require("./twitter_poster");

describe("TwitterPoster", () => {

    const db = fixtures.use("dynamodb");
    const twitter = fixtures.use("twitter");
    const config = fixtures.use("conf");

    describe("postDailyMetrics", () => {

        it("should post message when metric exists", (done) => {

            spyOn(db, "get").and.callFake(function(params, cb) {
                cb(null, { Item: { "avg": 1.25, "date": "2018-03-16", "count": 2 } });
            });

            let exporter = new TwitterPoster(config);

            exporter.postDailyMetrics("2018-03-17", (error) => {

                expect(error).toBe(null);

                done();

            });

        });

        it("should post message when metric does NOT exists", (done) => {

            spyOn(db, "get").and.callFake(function(params, cb) {
                cb(null, { });
            });

            let exporter = new TwitterPoster(config);

            exporter.postDailyMetrics("2018-03-17", (error) => {

                expect(error).toBe(null);

                done();

            });

        });

    });
});
