const fixtures = require('../../fixtures/fixtures');
const TwitterPoster = require('./twitter_poster');

describe('TwitterPoster postDailyMetrics', () => {

    const db = fixtures.use('dynamodb');
    const twitter = fixtures.use('twitter');
    const config = fixtures.use('conf');

    describe('should post message when metric exists', () => {

        it('contains days only', (done) => {

            spyOn(db, 'get').and.callFake(function(params, cb) {
                cb(null, { Item: { 'avg': 1.25, 'date': '2018-03-16', 'count': 2 } });
            });
            spyOn(twitter, 'post').and.callFake(function(path, params, cb) {
                cb(null, {}, { statusCode: 200 });
            });

            let exporter = new TwitterPoster(config);

            exporter.postDailyMetrics('2018-03-17', (error, message) => {

                expect(error).toBe(null);
                expect(message).toContain('1 day');

                done();

            });

        });

        it('contains also hours', (done) => {

            spyOn(db, 'get').and.callFake(function(params, cb) {
                cb(null, { Item: { 'avg': 1.5, 'date': '2018-03-16', 'count': 2 } });
            });
            spyOn(twitter, 'post').and.callFake(function(path, params, cb) {
                cb(null, {}, { statusCode: 200 });
            });

            let exporter = new TwitterPoster(config);

            exporter.postDailyMetrics('2018-03-17', (error, message) => {

                expect(error).toBe(null);
                expect(message).toContain('1 day and half');

                done();

            });

        });
    });

    it('should post message when metric does NOT exists', (done) => {

        spyOn(db, 'get').and.callFake(function(params, cb) {
            cb(null, { });
        });
        spyOn(twitter, 'post').and.callFake(function(path, params, cb) {
            cb(null, {}, { statusCode: 200 });
        });

        let exporter = new TwitterPoster(config);

        exporter.postDailyMetrics('2018-03-17', (error, message) => {

            expect(error).toBe(null);
            expect(message).toContain('No data');

            done();

        });

    });
});
