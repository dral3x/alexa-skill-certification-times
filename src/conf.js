const reconfig = require("reconfig");

// Determine which config file we should load
const env = (process.env.NODE_ENV || "conf").toLowerCase();

// Load config
module.exports = new reconfig(require("../conf/" + env));