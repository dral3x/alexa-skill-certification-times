module.exports = {

    // eslint-disable-next-line no-unused-vars
    canHandle(handlerInput, error) {
        return true;
    },

    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
        .speak('Sorry, an error occurred.')
        .reprompt('Sorry, an error occurred.')
        .getResponse();
    },

};