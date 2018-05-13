const formatter = require('./formatter');

class ItemFactory {

    itemFromAlexa(submissionDate, user, entryDate, entryValue) {

        let date = formatter.formatDate(entryDate);
        let timestamp = formatter.formatDateTime(submissionDate);

        return {
                "type": { "S": "ALEXA_SUBMISSION" },
                "date": { "S": date },
                "timestamp": { "S": timestamp },
                "user": { "S": user },
                "text": { "S": entryValue + " days" }
            };
    }

    itemFromTweet(submissionDate, user, id, entryDate, text) {

        let date = formatter.formatDate(entryDate);
        let timestamp = formatter.formatDateTime(submissionDate);

        return {
                "type": { "S": "PUBLIC_TWEET" },
                "date": { "S": date },
                "timestamp": { "S": timestamp },
                "id": { "S": id },
                "user": { "S": user },
                "text": { "S": text }
        };
    }

    itemFromDM(submissionDate, user, entryDate, text) {

        let date = formatter.formatDate(entryDate);
        let timestamp = formatter.formatDateTime(submissionDate);

        return {
                "type": { "S": "DIRECT_MESSAGE" },
                "date": { "S": date },
                "timestamp": { "S": timestamp },
                "user": { "S": user },
                "text": { "S": text }
        };
    }
}


module.exports = ItemFactory;