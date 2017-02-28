let fs = require("fs");
let http = require("http");
let q = require("bluebird");
let config = require("../config/server_config.js");

const apiKeys = config.API_KEYS;
const keys = config.KEY_TYPES;
const baseUrls = config.API_BASE_URLS;


function API_Services() {
    this.realTimePath = config.REAL_TIME_PATH;
};


API_Services.prototype.realTimeWeather = function(req, res) {
    let location = req.params.location;

    fetchRealTimeWeather(location).then(function(result) {
        //console.log(result);
        res.send(result);
    });
};


function fetchRealTimeWeather(loc) {
    const queries = config.REAL_TIME_QUERY
    const urls = keys.map(v => baseUrls[v] + queries[v](loc, apiKeys[v]));
    const promises = urls.map(v => new Promise(function(resolve, reject) {
        http.get(v, function(res) {
            let result = "";
            res.on("data", d => result += d);
            res.on("end", () => resolve(result));
            // TODO error handling
        });
    }));

    return q.any(promises);
}

module.exports = new API_Services();