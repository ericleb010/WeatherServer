let http = require("http");
let Promise = require("bluebird");
let logger = require("winston");

class ParameterError extends Error {
    constructor(message) {
        super(message || "Invalid parameter provided");
        this.name = "ParameterError";
    }
}

function Utils() {

    /*
        Helper function to send a GET request to a weather service.
    */
    this.sendRequestForWeather = function(serviceKey, url) {
        if (typeof serviceKey !== "string") {
            throw new ParameterError("serviceKey must be of string type.");
        }
        else if (typeof url !== "string") {
            throw new ParameterError("url must be of string type.");
        }

        return new Promise(function(resolve, reject) {
            http.get(url, function(res) {
                const contentType = res.headers["content-type"];
                if (res.statusCode >= 400) {
                    res.resume();
                    const level = res.statusCode < 500 ? 'alert' : 'warning';
                    logger[level]("Request failed while fetching weather from %s (%s): " + 
                        "status code was %d", serviceKey, url, res.statusCode
                    );

                    reject();
                }
                else if (!/^application\/json/.test(contentType)) {
                    res.resume();
                    logger.alert("Request failed while fetching weather from %s (%s):" +
                        "unexpected content-type %s", serviceKey, url, contentType
                    );

                    reject();
                }

                let result = "";
                res.on("data", d => result += d);
                res.on("end", function() {
                    logger.debug("Received data for %s: %j", serviceKey, result);
                    resolve(result);
                });
            }).on("error", function(err) {
                logger.err("Request failed while fetching weather from %s (%s):" +
                    "error object was %j", serviceKey, url, err, {}
                );

                reject();
            });
        });
    }

    this.ParameterError = ParameterError;
}

module.exports = new Utils();