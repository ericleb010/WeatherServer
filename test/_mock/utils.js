let Promise = require("bluebird");

class ParameterError extends Error {
    constructor(message) {
        super(message || "Invalid parameter provided");
        this.name = "ParameterError";
    }
}

const data = '{"data":"OK"}';

let urlToDataMap = {
    "example.com": {
        "A0": { "available": false },
        "A1": { "available": true, "delay": 30 },
        "A2": { "available": false },
        "A3": { "available": true },
        "A4": { "available": true, "delay": 30 },
        "A5": { "available": true, "delay": 10 },
        "A6": { "available": false },
        "A7": { "available": true, "delay": 10 },
        "A8": { "available": true, "delay": 10 },
        "A9": { "available": false, "delay": 30 },
        
        "Z0": { "available": false }
    },
    "example.org": {
        "A0": { "available": false },
        "A1": { "available": true },
        "A2": { "available": true, "delay": 10 },
        "A3": { "available": false },
        "A4": { "available": true, "delay": 1000 },
        "A5": { "available": false },
        "A6": { "available": true },
        "A7": { "available": true },
        "A8": { "available": true },
        "A9": { "available": true, "delay": 50 },

        "Z0": { "available": false }
    },
    "example.net": {
        "A0": { "available": true },
        "A1": { "available": true },
        "A2": { "available": true },
        "A3": { "available": false },
        "A4": { "available": true },
        "A5": { "available": false },
        "A6": { "available": true },
        "A7": { "available": false },
        "A8": { "available": true },
        "A9": { "available": true, "delay": 10 },

        "Z0": { "available": false }
    },

    "example.ca": {
        "A9": { "available": true }
    }
};

module.exports = {
    sendRequestForWeather: function(config, url) {
        return new Promise(function(resolve, reject) {
            let parts = url.split("/");
            let testRef = urlToDataMap[parts[0]][parts[1]];

            if (testRef.available) {
                if (testRef.delay !== undefined) {
                    setTimeout(() => resolve(data), testRef.delay);
                }
                else {
                    resolve(data);
                }
            }
            else {
                if (testRef.delay !== undefined) {
                    setTimeout(() => reject(), testRef.delay);
                }
                else {
                    reject();
                }
            } 
        });
    },

    ParameterError: ParameterError
};