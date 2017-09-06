let server = require("express")();
let logger = require("winston");

let config = require("../config/serverConfig.js");
let formatter = require("./formatter.js");
let router = require("./routes.js");

logger.level = config.LOG_LEVEL;
logger.setLevels(logger.config.syslog.levels);

server.listen(config.PORT, function() {
    logger.info(`Now listening on port ${config.PORT}...`);
    logger.info("Press CTRL+C to exit.\n");
});


// Set up the router.
server.use("/", router);

// Catch all unknown routes.
server.use(function(req, res, next) {
    res.success = false;
    res.errorCode = 404;
    res.error = new Error("Could not find what you were looking for on this server...");
    next();
}, formatter.sendStandardData);

// Catch all errors.
server.use(function(err, req, res, next) {
    res.success = false;
    res.errorCode = 500;
    res.error = err;
    next();
}, formatter.sendStandardData);