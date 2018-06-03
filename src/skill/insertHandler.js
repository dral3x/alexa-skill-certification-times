const moment = require('moment');

const Repository = require('./repository');

const phrases = require('./phrases');
const config = require('../conf');

module.exports = {

    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'InsertAverageTime';
    },

    async handle(handlerInput) {
        console.log('Triggered InsertAverageTime');
        
        let repository = new Repository(handlerInput.attributesManager, config);
        let date = moment(new Date())

        // Check if user can add entry or not
        if (!repository.canRecordEntry(date)) {
            return handlerInput.responseBuilder
                .speak(phrases.getPhrase('insertDeny'))
                .getResponse(); 
        }

        // Check if we have the duration in the intent
        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        console.log('slots: '+JSON.stringify(filledSlots, null, 2));

        // Check for duration slot
        if (!filledSlots.duration.value) {
            let prompt = phrases.getPhrase('insertAskDuration')

            return handlerInput.responseBuilder
                .speak(prompt)
                .reprompt(prompt)
                .addElicitSlotDirective('duration')
                .getResponse(); 
        }

        // Record the duration
        const user = handlerInput.requestEnvelope.context.System.user.userId;
        const duration = filledSlots.duration.value;
        try {
            await repository.recordNewEntry(user, date, duration);

            return handlerInput.responseBuilder
                .speak(phrases.getPhrase('insertDone'))
                .getResponse(); 

        } catch (error) {
            console.error(`Unable to record new entry: ${error}`)

            let message = phrases.getPhrase('insertFail');
            let reprompt = phrases.getPhrase('insertAskDuration');

            return handlerInput.responseBuilder
                .speak(message)
                .reprompt(reprompt)
                .getResponse(); 
        }
    },
};