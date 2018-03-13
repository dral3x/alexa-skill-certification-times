const fixtures	= require("../fixtures/fixtures");
const Generator  = require("./generator");

describe("Generator", () => {

    const db = fixtures.use("dynamodb");
    const s3 = fixtures.use("s3");
	
    const config = { generator: { table: "t", bucket: "b" } };

    describe("generateSite", () => {

        xit("should work", (done) => {

        	let generator = new Generator(this.config);

            generator.generateSite((error) => {

                expect(error).toBe(null);

                done();

            });

        });

    });
});
