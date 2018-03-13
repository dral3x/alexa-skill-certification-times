const fixtures  = require("../fixtures/fixtures");
const Importer  = require("./importer");

describe("Importer", () => {

    const config = fixtures.createConfig({ 
        importer: { table: "t" }, twitter: {}
    });

    describe("importData", () => {

        it("should work", (done) => {

            let importer = new Importer(config);

            importer.importData((error) => {

                expect(error).toBe(null);

                done();

            });

        });

    });
});
