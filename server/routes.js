let server = require("./server.js");
let api = require("./apiServices.js");
let formatter = require("./formatter.js");

// Define routes for the API
server.get("/current/:location", api.realTimeWeather, formatter.sendStandardData);

// Catch all errors.
server.use(function(req, res, next, err) {
    res.error = err;
    res.success = false;
    res.errorCode = 500;

    formatter.sendStandardData(req, res);
})