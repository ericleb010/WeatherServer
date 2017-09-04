let fs = require("fs");


const keySuffix = "_api_key";
const spTypes = ['OWM'];

let apiKeys = {};
spTypes.forEach(type => 
    apiKeys[type] = fs.readFileSync("config/" + type + keySuffix, { encoding: "ascii" }));


// Return this constant for propagation.
const config = {
    PORT: 4420,
    // APIs
    SP_TYPES: spTypes,
    API_KEYS: apiKeys,
    API_BASE_URLS: {
        "OWM": "http://api.openweathermap.org/data/2.5/"
    },
    REAL_TIME_QUERY: {
        "OWM": (loc, key) => "weather?id=" + loc + "&APPID=" + key
    },
    // Defaults
    DEFAULT_LOCATIONS: {
        "OWM": "5992996"
    }
}

module.exports = config;