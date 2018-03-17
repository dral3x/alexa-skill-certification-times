const fixtures  = require("../../fixtures/fixtures");
const Processor = require("./processor");

describe("Processor", () => {

    const config = fixtures.use("conf");
    const db = fixtures.use("dynamodb");
    const sns = fixtures.use("sns");
    
    describe("generateStats", () => {

        it("should do nothing when no results are returned", (done) => {

            let processor = new Processor(config);

            spyOn(db, "scan").and.callFake(function(param, cb) {
                cb(null, {
                    Items: []
                });
            });

            processor.generateStats(null, (error) => {

                expect(error).toBe(null);

                done();

            });

        });

        it("should handle errors coming from dynamodb", (done) => {

            let processor = new Processor(config);

            spyOn(db, "scan").and.callFake(function(param, cb) {
                cb("ERROR");
            });

            processor.generateStats([ "2018-03-01" ], (error) => {

                expect(error).not.toBe(null);

                done();

            });

        });

        it("process multiple dates", (done) => {

            let processor = new Processor(config);

            spyOn(db, "scan").and.callFake(function(param, cb) {
                cb(null, {
                    Items: []
                });
            });

            processor.generateStats([ "2018-03-01", "2018-03-02" ], (error) => {

                expect(error).toBe(null);

                expect(db.scan).toHaveBeenCalledTimes(2);

                done();

            });

        });

    });
});
