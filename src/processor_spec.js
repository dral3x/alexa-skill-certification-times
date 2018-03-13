const fixtures  = require("../fixtures/fixtures");
const Processor = require("./processor");

describe("Processor", () => {

    const db = fixtures.use("dynamodb");
    const config = fixtures.createConfig({ processor: { table_source: "t_in", table_daily: "t_out" } });

    describe("generateStats", () => {

        it("should do nothing when no results are returned", (done) => {

            let processor = new Processor(config, "2018-03-01");

            spyOn(db, "scan").and.callFake(function(param, cb) {
                cb(null, {
                    Items: []
                });
            });

            processor.generateStats((error) => {

                expect(error).toBe(null);

                done();

            });

        });

        it("should handle errors coming from dynamodb", (done) => {

            let processor = new Processor(config, "2018-03-01");

            spyOn(db, "scan").and.callFake(function(param, cb) {
                cb("ERROR");
            });

            processor.generateStats((error) => {

                expect(error).not.toBe(null);

                done();

            });

        });

    });
});
