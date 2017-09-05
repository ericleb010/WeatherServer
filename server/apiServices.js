let Q = require("bluebird");
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

        utils.sendRequestForWeather(service, url, function(result) {
            let final = {
                "priority": priority,
                "service": service,
                "data": result
            };
            logger.debug("Received data for %s: %j", service, final);
            resolve(final);
        }, reject);
    }));

    // We want to return the result which matched a combination of the following criteria:
    // - Was one of the top two fastest responses
    // - Was from the highest prioritized service as defined in the config.
    return Q.some(promises, Math.min(2, promises.length))
            .spread(function(...responses) {
                const finalSelection = responses.reduce((lowest, curr) => 
                    (lowest.priority < curr.priority) ? lowest : curr
                );

                logger.debug(`
                    Final selection was %s, priority %d`, 
                    finalSelection.service, finalSelection.priority
                );
                return finalSelection;
            }
    )
}


// Export an object of Express-compatible middleware functions.
function APIServices() {
    this.realTimeWeather = function(req, res, next) {
        let location = req.params.location;
    
        fetchRealTimeWeather(location).then(function(result) {
            res.data = result;
            next();
        });
    };
}

module.exports = new APIServices();