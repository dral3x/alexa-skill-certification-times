const DateUtil  = require("./date_util");

describe("DateUtil", () => {

    describe("parseDate", () => {

        it("should work", () => {

            expect(DateUtil.parseDate("")).toBe(null);
            
            //expect(DateUtil.parseDate("Sun Mar 11 07:59:43 +0000 2018")).not.toBe(null);

            expect(DateUtil.parseDate("2018-03-11 07:59:43")).not.toBe(null);

        });

    });

    describe("formatDate", () => {

        it("should work", () => {

        	let date = new Date("2018-03-11 07:59:43");

            expect(DateUtil.formatDate(date, "YYYY-MM-DD HH:mm:ss", false)).toBe("2018-03-11 07:59:43");

            expect(DateUtil.formatDate(date, "YYYY-MM-DD", false)).toBe("2018-03-11");

        });

    });
});
