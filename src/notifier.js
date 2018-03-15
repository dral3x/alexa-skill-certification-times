const AWS       = require('aws-sdk');

module.exports = {

    publish: function (topic, message, callback) {

        var sns = new AWS.SNS();
        var params = {
            Message: message, 
            TopicArn: topic
        };
        sns.publish(params, callback);

    }
};
