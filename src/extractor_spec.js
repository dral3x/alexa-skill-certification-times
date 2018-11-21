const Extractor  = require("./extractor");

describe("Extractor", () => {

    describe("readDays", () => {

        it("should returns X days", () => {

            expect(Extractor.readDays("0 days")).toBe(0);
            expect(Extractor.readDays("1 day")).toBe(1);
            expect(Extractor.readDays("2 days")).toBe(2);

            expect(Extractor.readDays("12 days")).toBe(12);

            expect(Extractor.readDays("5 working days")).toBe(5);

        });

        it("should returns NULL when missing", () => {

            expect(Extractor.readDays("")).toBe(null);

            expect(Extractor.readDays("3 hours")).toBe(null);

            expect(Extractor.readDays("missing something")).toBe(null);

        });

        it("should handle some real cases", () => {

            expect(Extractor.readDays("@figureink #iosreviewtime 0 days 19 minutes. 😱 Might be because almost only change I have done was adding the NSPho… https://t.co/JSv6JN68Qg")).toBe(0);
            expect(Extractor.readDays("Unicorn Adventures took less then 1 day #iosreviewtime")).toBe(1);
            expect(Extractor.readDays("Oh my, 40 minutes from \"Complete Processing\" to \"Ready for Sale\". Congrats reviewers from #appstore! #iosreviewtime")).toBe(null);
            expect(Extractor.readDays("Latest version, with Wikipedia AR POI markers, 2 finger rotation of the horizon line, and some other fixes is now a… https://t.co/5xoxTxIrip")).toBe(null);
            expect(Extractor.readDays("#iosreviewtime it's been more than a month in this hide n seek... I rejected the app after 17 days intentionally as… https://t.co/J1okE8zZ0n")).toBe(17);
            expect(Extractor.readDays("#iosreviewtime 3 hours")).toBe(null);
            expect(Extractor.readDays("Unicorn Adventures took less then 1 day #iosreviewtime https://t.co/9n4sQZdtCW #gamedev #iosdev #SwiftLang https://t.co/j7PpnsZ2VO")).toBe(1);
            expect(Extractor.readDays("RT @cr_wells: Unicorn Adventures took less then 1 day #iosreviewtime ")).toBe(1);
            expect(Extractor.readDays("I have 2 skills released so far. Both were certified within 1.5 days. Even on the weekend! #skillcertificationtime")).toBe(1.5);
            expect(Extractor.readDays("Spreaker Podcast Radio Player #AlexaSkill latest update has been approved in 1 working day! 🎉… https://t.co/aOculSxIef")).toBe(1);
        });

    });

    describe("extractDate", () => {

        it("should work", () => {

            expect(Extractor.extractDate("0 days")).toBe(null);
            expect(Extractor.extractDate("bla 5 days bla")).toBe(null);

            expect(Extractor.extractDate("2018-03-01")).not.toBe(null);
            expect(Extractor.extractDate("bla 2018-03-01 bla")).not.toBe(null);

            expect(Extractor.extractDate("bla 8 mar bla")).not.toBe(null);
            expect(Extractor.extractDate("bla 12 dec bla")).not.toBe(null);

        });

    });
});
