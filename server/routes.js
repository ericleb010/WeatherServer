let server = require("./server.js");
let api = require("./apiServices.js");
let formatter = require("./formatter.js");

// Define routes for the API
server.get("/current/:location", api.realTimeWeather, formatter.sendStandardData);