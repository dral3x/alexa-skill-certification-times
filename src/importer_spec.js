const Importer  = require("./importer");

describe("Importer", () => {

    describe("importData", () => {

        xit("should work", (done) => {

        	let importer = new Importer();

            importer.importData((error) => {

                expect(error).toBe(null);

                done();

            });

        });

    });
});
