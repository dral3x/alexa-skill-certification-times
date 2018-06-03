const phrases = require('./phrases');

module.exports = {

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },

    handle(handlerInput) {
        let greetings = phrases.getPhrase('welcome');
        let ask = phrases.getPhrase('promptInsert')

        return handlerInput.responseBuilder
        .speak(greetings + " " + ask)
        .reprompt(ask)
        .getResponse();
    },

};