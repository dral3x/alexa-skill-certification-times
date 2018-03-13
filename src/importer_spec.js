const Importer  = require("./importer");

describe("Importer", () => {

	const config = { importer: { table: "t" }, twitter: {} };

    describe("importData", () => {

        xit("should work", (done) => {

        	let importer = new Importer(this.config);

            importer.importData((error) => {

                expect(error).toBe(null);

                done();

            });

        });

    });
});
