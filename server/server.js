let server = require("express")();
let logger = require("winston");

let config = require("../config/serverConfig.js");

logger.level = config.LOG_LEVEL;
logger.info("\nNow listening on port " + config.PORT + "...");
logger.info("Press CTRL+C to exit.");
server.listen(config.PORT);

module.exports = server;