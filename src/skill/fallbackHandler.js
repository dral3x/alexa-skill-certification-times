const phrases = require('./phrases');

module.exports = {
  
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.FallbackIntent';
    },

    handle(handlerInput) {

        return handlerInput.responseBuilder
        .speak(phrases.getPhrase('genericError'))
        .getResponse();
    },

};