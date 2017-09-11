let Promise = require("bluebird");
let logger = require("winston");

let config = require("../config/serverConfig.js");
let utils = require("./utils.js");

const apiKeys = config.API_KEYS;
const services = config.SP_TYPES;
const baseUrls = config.API_BASE_URLS;


// This makes the call to each service we're set up to hit, for redundancy.
function fetchRealTimeWeather(loc) {
    const location = loc || config.DEFAULT_LOCATION;
    const queries = config.REAL_TIME_QUERY;

    // Forming our URLs and promises for each service.
    const urls = services.map(key => baseUrls[key] + queries[key](location, apiKeys[key]));
    const promises = urls.map((url, priority) => new Promise(function(resolve, reject) {
        const service = services[priority];

        utils.sendRequestForWeather(service, url).then(function(result) {
            let final = {
                "priority": priority,
                "service": service,
                "data": result
            };
            logger.debug("Received data for %s: %j", service, final, {});
            resolve(final);
        }, reject);

    }));

    // We want to return the result which matched a combination of the following criteria:
    // - Was one of the top two fastest responses
    // - Was from the highest prioritized service as defined in the config.
    return Promise.some(promises, Math.min(config.SERVICE_RESPONSES_MIN, promises.length))
            .spread(function(...responses) {
                const finalSelection = responses.reduce((lowest, curr) => 
                    (lowest.priority < curr.priority) ? lowest : curr
                );

                logger.debug("Final selection was %s, priority %d",
                    finalSelection.service, finalSelection.priority
                );
                return finalSelection;
            })
            .catch(Promise.AggregateError, function(err) {
                // Bluebird will error out if it can't reach the minimum.
                // However, we'll make one more sanity check so we can send something back.
                for (let i = 0; i < promises.length; i++) {
                    if (promises[i].isFulfilled()) {
                        return promises[i];
                    }
                }

                // If we reach here, something went really wrong -- what are the odds we
                // failed everything we attempted? -- like a network issue.
                logger.alert("Could not contact any of %d external servers", promises.length);
                logger.debug("AggregateError handled: %j", err, {});
                return Promise.reject(new Error("Could not connect to weather servers at this time."));
            })
            .error(function(err) {
                // Random error occurred, have to handle it.
                logger.alert("Safely handled the following unknown error: %j", err, {});
                return Promise.reject(new Error("An error has occurred when trying to get real-time weather."));
            });
}


// Export an object of Express-compatible middleware functions.
function APIServices() {
    this.heartbeat = function(req, res, next) {
        res.success = true;
        res.errorCode = 200;
        res.data = { status: "OK" };
        next();
    };

    this.realTimeWeather = function(req, res, next) {
        let location = req.params.location;
        res.success = true;
    
        fetchRealTimeWeather(location).then(function(result) {
            res.data = result;
        }).catch(function(err) {
            res.success = false;
            res.errorCode = 503;
            res.error = err;
        }).finally(() => next());
    };
}

module.exports = new APIServices();