let server = require("./server.js");
let api = require("./apiServices.js")

// Define routes for the API
server.get("/current/:location", api.realTimeWeather);