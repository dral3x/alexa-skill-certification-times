const phrases = require('./phrases');

module.exports = {

  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && 
    (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
  },

  handle(handlerInput) {

    let message = phrases.getPhrase('goodbye');

    return handlerInput.responseBuilder
      .speak(message)
      .getResponse();
  },

};