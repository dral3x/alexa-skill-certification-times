const moment = require('moment');

module.exports = {

	readDays: function(string) {

		var pattern = /(\d+) day(s?)/;
		var match = string.match(pattern);
		return match != null ? parseInt(match[1], 10) : null;
	},

	extractDate: function(string) {

		var pattern;
		var match;

		// format: YYYY-MM-DD and YYYY-M-D
		pattern = /(\d{4})\-(\d{1,2})\-(\d{1,2})/;
		match = string.match(pattern);
		if (match != null) {
			let date = moment([match[1], match[2]-1, match[3]]); 
			return date.isValid() ? date.format("YYYY-MM-DD") : null;
		}
		
		// format: D MMM
		pattern = /(\d{1,2}) (\w{3})/;
		match = string.match(pattern);
		if (match != null) {
			let year = moment().year();
			let date = moment([year, 0, match[1]]).month(match[2]);
			return date.isValid() ? date.format("YYYY-MM-DD") : null;
		}

		return null;
	}

};