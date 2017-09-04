let http = require("http");
let Q = require("bluebird");
let logger = require("winston");
let config = require("../config/serverConfig.js");

const apiKeys = config.API_KEYS;
const services = config.SP_TYPES;
const baseUrls = config.API_BASE_URLS;

// This makes the call to each service we're set up to, for redundancy.
function fetchRealTimeWeather(loc) {
    const location = loc || config.DEFAULT_LOCATION;
    const queries = config.REAL_TIME_QUERY;
    const urls = services.map(key => baseUrls[key] + queries[key](location, apiKeys[key]));
    const promises = urls.map((url, priority) => new Promise(function(resolve, reject) {
        http.get(url, function(res) {
            let result = "";
            res.on("data", d => result += d);
            res.on("end", function() {
                let final = {
                    "priority": priority,
                    "service": services[priority],
                    "data": result
                }
                logger.debug("Received data: %j", final)
                resolve(final);
            });
            // TODO error handling
        });
    }));

    // We want to return the result which matched a combination of the following criteria:
    // - Was one of the top two fastest responses
    // - Was from the highest prioritized service as defined in the config.
    return Q.some(promises, Math.min(2, promises.length))
            .spread(function(...responses) {
                return responses.reduce((lowest, curr) => 
                    (lowest.priority < curr.priority) ? lowest : curr
                );
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