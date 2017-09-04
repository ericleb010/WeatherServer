let http = require("http");
let Q = require("bluebird");
let config = require("../config/serverConfig.js");

const apiKeys = config.API_KEYS;
const services = config.SP_TYPES;
const baseUrls = config.API_BASE_URLS;

function fetchRealTimeWeather(loc) {
    const queries = config.REAL_TIME_QUERY;
    const urls = services.map(v => baseUrls[v] + queries[v](loc, apiKeys[v]));
    const promises = urls.map(v => new Promise(function(resolve, reject) {
        http.get(v, function(res) {
            let result = "";
            res.on("data", d => result += d);
            res.on("end", () => resolve(result));
            // TODO error handling
        });
    }));

    return Q.any(promises);
}


function APIServices() {
    this.realTimePath = config.REAL_TIME_PATH;
}

APIServices.prototype.realTimeWeather = function(req, res) {
    let location = req.params.location;

    fetchRealTimeWeather(location).then(function(result) {
        res.send(result);
    });
};

module.exports = new APIServices();