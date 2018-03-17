const AWS       = require('aws-sdk');

module.exports = {

    publish: function (topic, message, callback) {

        var sns = new AWS.SNS();
        var params = {
            Message: JSON.stringify(message, null, 2), 
            TopicArn: topic
        };
        sns.publish(params, callback);

    }
};
