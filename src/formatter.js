const moment = require('moment');

class Formatter {

    formatDate(date) {

        let parsed = moment(date);
        if (!parsed.isValid()) {
            return null;
        }

        return parsed.format('YYYY-MM-DD', true);
    }

    formatDateTime(date) {
        
        let parsed = moment(date);
        if (!parsed.isValid()) {
            return null;
        }

        return parsed.format('YYYY-MM-DD HH:mm:ss', true);
    }

    formatHumanDate(date) {

        let parsed = moment(date);
        if (!parsed.isValid()) {
            return null;
        }

        return parsed.format('MMM D, YYYY', true);
    }

    formatHumanDateTime(date) {

        let parsed = moment(date);
        if (!parsed.isValid()) {
            return null;
        }

        return parsed.format('MMM D, YYYY [at] HH:mm:ss [UTC]', true);
    }

    formatHumanDuration(duration) {
        
        let days = Math.floor(duration);
        let hours = duration - Math.floor(duration);
        
        return days + (Math.abs(days) == 1 ? ' day' : ' days') + (hours >= 0.5 ? ' and half' : '');
    }

    formatEmojiResult(result) {

        return result <= 5.0 ? '🎉' : '🐌';
    }
}

module.exports = new Formatter();
