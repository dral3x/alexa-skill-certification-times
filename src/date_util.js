const moment = require('moment');

module.exports = {

    parseDate: function(string) {

        let date = moment(string);
        return date.isValid() ? date : null;
    },

    formatDate: function(date, format, utc) {

        return moment(date).format(format, utc);
    }

};