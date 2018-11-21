const Data = require("./template_data");
const moment    = require('moment');

describe("Data", () => {

    it("should return ordered dates", () => {

        let data = new Data("2018-03-30");

        data.addEntry("2018-03-30", 30, 30);
        data.addEntry("2018-03-01", 1, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result["last_30_days"][0]["date"]).toBe("2018-03-01");
        expect(result["last_30_days"][1]["date"]).toBe("2018-03-30");

    });

    it("startDate should be 2 times the cycle", () => {

        expect(new Data("2018-03-30").startDate()).toBe("2018-01-29");
        expect(new Data("2018-03-16").startDate()).toBe("2018-01-15");

    });

    it("endDate should be the reference date", () => {

        expect(new Data("2018-03-30").endDate()).toBe("2018-03-30");
        expect(new Data("2018-03-16").endDate()).toBe("2018-03-16");

    });

    it("test example 1", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 15, 1);
        data.addEntry("2018-03-12", 3.25, 4);
        data.addEntry("2018-03-16", 1, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.overall.average).toBe(5);
        expect(result.overall.average_text).toBe("5 days");

    });

    it("text example 2", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 15, 1);
        data.addEntry("2018-03-16", 1, 1);
        data.addEntry("2018-03-12", 3.25, 4);
        data.addEntry("2018-01-24", 9, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.overall.average).toBe(5);
        expect(result.overall.average_text).toBe("5 days");
        expect(result.overall.count).toBe(6);
        expect(result.overall.diff).toBe(-4);
        expect(result.overall.diff_text).toBe("-4 days");

    });

    it("text example 3", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 1, 1);
        data.addEntry("2018-01-08", 2, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.overall.average).toBe(1);
        expect(result.overall.average_text).toBe("1 day");
        expect(result.overall.count).toBe(1);
        expect(result.overall.diff).toBe(-1);
        expect(result.overall.diff_text).toBe("-1 day");

    });

    it("text example 4", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 2, 1);
        data.addEntry("2018-01-08", 1, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.overall.average).toBe(2);
        expect(result.overall.average_text).toBe("2 days");
        expect(result.overall.count).toBe(1);
        expect(result.overall.diff).toBe(1);
        expect(result.overall.diff_text).toBe("+1 day");

    });

    it("test data with positive diff", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 2, 1);
        data.addEntry("2018-01-08", 1, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.hasDiff).toBe(true);
        expect(result.noDiff).toBe(false);

    });

    it("test data with negative diff", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 1, 1);
        data.addEntry("2018-01-08", 2, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.hasDiff).toBe(true);
        expect(result.noDiff).toBe(false);

    });

    it("test data without diff", () => {

        let data = new Data("2018-03-16");

        data.addEntry("2018-03-08", 1, 1);
        data.addEntry("2018-01-08", 1, 1);

        let result = data.export();

        expect(result).not.toBe(null);
        expect(result.hasDiff).toBe(false);
        expect(result.noDiff).toBe(true);

    });
});
