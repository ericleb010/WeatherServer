// System-wide imports
let server = require("express")();
let http = require("http");
let fs = require("fs");
// Project-wide imports
let config = require("../config/server_config.js");
let api = require("./api_services.js");


// Get API key for weather GET requests
const keySuffix = "_api_key";
const keyTypes = ['OWM'];
const apiKeys = keyTypes.map(type => 
    fs.readFileSync("config/" + type + keySuffix, { encoding: "ascii" }));


// Define routes for the API
server.get(api.realTimePath, api.realTimeWeather);


console.log("\nNow listening on port " + config.port + "...");
console.log("Press CTRL+C to exit.");
server.listen(config.port);

// TEST
// http.get("http://api.openweathermap.org/data/2.5/weather?id=5992996&APPID=" + apiKeys[0], function(res) {
//     let data = "";
//     res.on('data', d => data += d );
//     res.on('end', d => console.log(JSON.parse(data)));
// });