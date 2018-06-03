const Alexa = require('ask-sdk-core');
const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
const AWS = require('aws-sdk');
const config = require('./src/conf');

/* Configure AWS services */

AWS.config.update({region: config.get('aws.region')});

/* Configure Skill */

// Persist data on DynamoDB
const PersistenceAdapter = new DynamoDbPersistenceAdapter({
    createTable: true,
    tableName: config.get("dynamodb.table_skill")
});

// List of handlers, one for each command
const LaunchRequestHandler = require('./src/skill/launchRequestHandler');
const SessionEndedRequestHandler = require('./src/skill/sessionEndedRequestHandler');
const ReadHandler = require('./src/skill/readHandler');
const InsertHandler = require('./src/skill/insertHandler');
const HelpHandler = require('./src/skill/helpHandler');
const ExitHandler = require('./src/skill/exitHandler');
const FallbackHandler = require('./src/skill/fallbackHandler');
const ErrorHandler = require('./src/skill/errorHandler');

// Build the skill
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .withPersistenceAdapter(PersistenceAdapter)
    .addRequestHandlers(
        LaunchRequestHandler,
        SessionEndedRequestHandler,
        ReadHandler,
        InsertHandler,
        HelpHandler,
        ExitHandler,
        FallbackHandler
        )
    .addErrorHandlers(
        ErrorHandler
        )
    .lambda();