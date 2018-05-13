const moment = require('moment');

module.exports = {

    readDays: function(string) {

        var pattern = /(\d+(\.\d+)?) day(s?)/;
        var match = string.match(pattern);
        return match != null ? parseFloat(match[1], 10) : null;
    },

    extractDate: function(string) {

        var pattern;
        var match;

        // format: YYYY-MM-DD and YYYY-M-D
        pattern = /(\d{4})\-(\d{1,2})\-(\d{1,2})/;
        match = string.match(pattern);
        if (match != null) {
            let date = moment([match[1], match[2]-1, match[3]]); 
            return date.isValid() ? date : null;
        }
		
        // format: D MMM
        pattern = /(\d{1,2}) (\w{3})/;
        match = string.match(pattern);
        if (match != null) {
            let year = moment().year();
            let date = moment(match[0], "D MMM").year(year);
            return date.isValid() ? date : null;
        }

        return null;
    }

};