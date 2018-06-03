const phrases = require('./phrases');

module.exports = {

    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },

    handle(handlerInput) {

        let message = phrases.getPhrase('help');

        return handlerInput.responseBuilder
        .speak(message)
        .reprompt(message)
        .getResponse();
    },

};