module.exports = {

	readDays: function(string) {

		var pattern = /(\d+) day(s?)/;
		var match = string.match(pattern);
		return match != null ? parseInt(match[1], 10) : null;
	}

};