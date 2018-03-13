const Counter  = require("./counter");

describe("Counter", () => {

    describe("readDays", () => {

        it("should returns X days", () => {

            expect(Counter.readDays("0 days")).toBe(0);
            expect(Counter.readDays("1 day")).toBe(1);
            expect(Counter.readDays("2 days")).toBe(2);

            expect(Counter.readDays("12 days")).toBe(12);

        });

        it("should returns NULL when missing", () => {

            expect(Counter.readDays("")).toBe(null);

            expect(Counter.readDays("3 hours")).toBe(null);

            expect(Counter.readDays("missing something")).toBe(null);


        });

        it("should handle some real cases", () => {

            expect(Counter.readDays("@figureink #iosreviewtime 0 days 19 minutes. 😱 Might be because almost only change I have done was adding the NSPho… https://t.co/JSv6JN68Qg")).toBe(0);
            expect(Counter.readDays("Unicorn Adventures took less then 1 day #iosreviewtime")).toBe(1);
            expect(Counter.readDays("Oh my, 40 minutes from \"Complete Processing\" to \"Ready for Sale\". Congrats reviewers from #appstore! #iosreviewtime")).toBe(null);
            expect(Counter.readDays("Latest version, with Wikipedia AR POI markers, 2 finger rotation of the horizon line, and some other fixes is now a… https://t.co/5xoxTxIrip")).toBe(null);
            expect(Counter.readDays("#iosreviewtime it's been more than a month in this hide n seek... I rejected the app after 17 days intentionally as… https://t.co/J1okE8zZ0n")).toBe(17);
            expect(Counter.readDays("Average review time for 11 Mar. iOS: 2 days, Mac: 5 days. https://t.co/JkX4SnMuTP. Contribute with #iosreviewtime or #macreviewtime.")).toBe(2);
            expect(Counter.readDays("#iosreviewtime 3 hours")).toBe(null);
            expect(Counter.readDays("Unicorn Adventures took less then 1 day #iosreviewtime https://t.co/9n4sQZdtCW #gamedev #iosdev #SwiftLang https://t.co/j7PpnsZ2VO")).toBe(1);
            expect(Counter.readDays("RT @cr_wells: Unicorn Adventures took less then 1 day #iosreviewtime ")).toBe(1);

        });

    });

});
