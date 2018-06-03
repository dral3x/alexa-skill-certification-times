const fixtures  = require('../../fixtures/fixtures');
const Repository = require('./repository');

describe('Repository', () => {

    const db = fixtures.use('dynamodb');
    const config = fixtures.use("conf");
    const state = {};

    xit('should update all pages', (done) => {

        let repository = new Repository(state, config);

        repository.getCurrentAverage().then((res) => {

            expect(res).toBe("NOIDEA");

            done();

        }).catch(done.fail);

    });
});