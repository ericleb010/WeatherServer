let router = require("express").Router();

let api = require("./apiServices.js");
let formatter = require("./formatter.js");

// Define routes for the API
router.get("/", api.heartbeat, formatter.sendStandardData);
router.get("/current/:location", api.realTimeWeather, formatter.sendStandardData);

module.exports = router;