let http = require("http");
let logger = require("winston");

function Utils() {

    /*
        Helper function to send a GET request to a weather service.
    */
    this.sendRequestForWeather = function(serviceKey, url, successFunc, failFunc) {
        if (typeof serviceKey !== 'string' || typeof url !== 'string') {
            throw new Error("serviceKey and url must be of string type.");
        }
        if (successFunc && typeof successFunc !== 'function' || failFunc && typeof failFunc !== 'function') {
            throw new Error("successFunc and failFunc must be of function type.");
        }

        http.get(url, function(res) {
            const contentType = res.headers["Content-Type"];
            if (res.statusCode >= 400) {
                res.resume();
                const level = res.statusCode < 500 ? 'crit' : 'warning';
                logger[level](`
                    Request failed while fetching weather from %s (%s): 
                    status code was %d`, serviceKey, url, res.statusCode
                );

                if (failFunc) failFunc();
            }
            else if (!/^application\/json/.test(contentType)) {
                res.resume();
                logger.alert(`
                    Request failed while fetching weather from %s (%s):
                    unexpected content-type %s`, serviceKey, url, contentType
                );

                if (failFunc) failFunc();
            }

            let result = "";
            res.on("data", d => result += d);
            res.on("end", function() {
                logger.debug("Received data for %s: %j", serviceKey, result);
                if (successFunc) successFunc(result);
            });
        }).on("error", function(err) {
            logger.error(`
                Request failed while fetching weather from %s (%s):
                error object was `, serviceKey, url, err
            );

            if (failFunc) failFunc();
        });
    }
}

module.exports = new Utils();