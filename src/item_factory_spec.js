const Factory  = require('./item_factory');

describe('Factory', () => {

    let factory = new Factory();
    let date1 = new Date('2018-04-15 12:00:00');
    let date2 = new Date('2018-04-15 13:00:00');

    describe('Item from Alexa', () => {

        let item = factory.itemFromAlexa(date1, 'USER_42', date2, 5);

        it('generates a alexa item', () => {

            expect(item).not.toBe(null)
            expect(item.type).toEqual({ 'S': 'ALEXA_SUBMISSION' });
            expect(item.date).toEqual({ 'S': '2018-04-15' });
            expect(item.timestamp).toEqual({ 'S': '2018-04-15 12:00:00' });
            expect(item.user).toEqual({ 'S': 'USER_42' });
            expect(item.text).toEqual({ 'S': '5 days' });

        });

    });

    describe('Item from public tweet', () => {

        let item = factory.itemFromTweet(date1, 'USER_42', 'TWEET_ID_1', date2, 'LOL 5 days');

        it('generates a public tweet item', () => {

            expect(item).not.toBe(null)
            expect(item.type).toEqual({ 'S': 'PUBLIC_TWEET' });
            expect(item.date).toEqual({ 'S': '2018-04-15' });
            expect(item.timestamp).toEqual({ 'S': '2018-04-15 12:00:00' });
            expect(item.user).toEqual({ 'S': 'USER_42' });
            expect(item.text).toEqual({ 'S': 'LOL 5 days' });

        });

    });

    describe('Item from Twitter DM', () => {

        let item = factory.itemFromDM(date1, 'USER_42', date2, 'LOL 5 days');

        it('generates a direct message item', () => {

            expect(item).not.toBe(null)
            expect(item.type).toEqual({ 'S': 'DIRECT_MESSAGE' });
            expect(item.date).toEqual({ 'S': '2018-04-15' });
            expect(item.timestamp).toEqual({ 'S': '2018-04-15 12:00:00' });
            expect(item.user).toEqual({ 'S': 'USER_42' });
            expect(item.text).toEqual({ 'S': 'LOL 5 days' });

        });

    });

});
