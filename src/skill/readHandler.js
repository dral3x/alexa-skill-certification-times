const Repository = require('./repository');

const phrases = require('./phrases');
const config = require('../conf');

module.exports = {

    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ReadAverageTime';
    },

    async handle(handlerInput) {
        console.log('Triggered ReadAverageTime');

        let repository = new Repository(handlerInput.attributesManager, config);
        let outputSpeech = '';

        try {
            let overall = await repository.getCurrentAverage();
            console.info("> "+JSON.stringify(overall, null, 2));

            outputSpeech = phrases.getPhrase('currentAverage', overall.average_text);
            if (overall.diff != 0) {
                outputSpeech += phrases.getPhrase('currentAverageDiff', overall.diff_text);
            }
        } catch (error) {
            outputSpeech = phrases.getPhrase('currentAverageError');
        }

        return handlerInput.responseBuilder
        .speak(outputSpeech)
        .getResponse(); 
    },

};