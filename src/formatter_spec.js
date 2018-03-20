const formatter = require("./formatter");

describe("Formatter", () => {

    it("formatHumanDuration should work", () => {

        expect(formatter.formatHumanDuration(1)).toBe("1 day");
        expect(formatter.formatHumanDuration(2)).toBe("2 days");

        expect(formatter.formatHumanDuration(1.1)).toBe("1 day");
        expect(formatter.formatHumanDuration(1.5)).toBe("1 day and half");

        expect(formatter.formatHumanDuration(-1)).toBe("-1 day");
        expect(formatter.formatHumanDuration(-2)).toBe("-2 days");

    });

    it("formatDate should work", () => {

        expect(formatter.formatDate(new Date("2018-03-01"))).toBe("2018-03-01");

    });

    it("formatHumanDate should work", () => {

        expect(formatter.formatHumanDate(new Date("2018-03-01"))).toBe("Mar 1, 2018");

    });

    it("formatHumanDateTime should work", () => {

        expect(formatter.formatHumanDateTime(new Date("2018-03-01T08:30:25+01:00"))).toBe("Mar 1, 2018 at 08:30:25 UTC");

    });

});
