const fixtures  = require('../../fixtures/fixtures');
const WebsiteGenerator  = require('./website_generator');

describe('Generator', () => {

    const db = fixtures.use('dynamodb');
    const s3 = fixtures.use('s3');
    const config = fixtures.use('conf');

    describe('generateSite', () => {

        beforeEach(() => {

            spyOn(db, 'scan').and.callFake(function(param, cb) {
                cb(null, {
                    Items: [{
                        'date': { 'S': '2018-03-20' }, 
                        'avg': { 'N': 1 }, 
                        'count': { 'N': 1 }
                    }]
                });
            });

            spyOn(s3, 'getObject').and.callFake(function(param, cb) {
                cb(null, {
                    Body: {
                        toString: function() {
                            return 'file_content';
                        }
                    }
                });
            });

            spyOn(s3, 'putObject').and.callFake(function(param, cb) {
                cb(null, 'UPDATED!');
            });

        });

        it('should update all pages', (done) => {

            let generator = new WebsiteGenerator(config);

            generator.generateSite((error) => {

                expect(error).toBe(null);
                
                let getFiles = []
                getFiles.push(s3.getObject.calls.argsFor(0)[0].Key);
                getFiles.push(s3.getObject.calls.argsFor(1)[0].Key);

                expect(getFiles).toContain('templates/index.html');
                expect(getFiles).toContain('templates/contribute.html');

                let putFiles = []
                putFiles.push(s3.putObject.calls.argsFor(0)[0].Key);
                putFiles.push(s3.putObject.calls.argsFor(1)[0].Key);

                expect(putFiles).toContain('public/index.html');
                expect(putFiles).toContain('public/contribute.html');

                done();

            });

        });

    });
});
