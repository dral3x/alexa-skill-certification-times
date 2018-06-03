var compile = require('string-template/compile');

const phrases = {
    
    /* Welcome */
    welcome                 : [ "Welcome!", "Hello there!", "Hi!", "Hey fellow developer!" ],
    promptInsert            : [ "To know the current average time, say: current average. To share your latest review time, say: record new time" ],

    /* Read */
    currentAverage          : [ "the current average certification time is {0}" ],
    currentAverageDiff      : [ ", {0} compared to the last 30 days" ],
    currentAverageError     : [ "Sorry but I cannot get this information. Please try again" ],

    /* Insert */
    insertDone              : [ "Data recorded. Thank you!" ],
    insertFail              : [ "Sorry, something went wrong. Can you repeat how much time it took?" ],
    insertAskDuration       : [ "How much time it took?" ],
    insertDeny              : [ "You cannot add more reports for today" ],

    /* Help */
    help                    : [ "To get current average time, say: current average. To record your latest review time, say: record new time. For more details and charts, visit: skill certification times.com" ],

    /* Error */
    genericError            : [ "Sorry but I'm confused now. Please, try again." ],

    /* General */
    goodbye                 : [ "Ok!", "See you!", "As you wish", "No problem!", "As you like", "Of course", "Sure thing!", "Consider it done" ]
};


module.exports = {

    getPhrase: (phrase, data) => {

        var alternatives = phrases[phrase];
        if (alternatives === undefined) {
            throw new Error('Unknown phrase: '+phrase);
        }

        var selected = alternatives[Math.floor(Math.random()*alternatives.length)];

        return compile(selected)(data);
    }
    
};
