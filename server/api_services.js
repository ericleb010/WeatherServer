let config = require("../config/server_config.js");

function API_Services() {
    this.realTimePath = config.real_time_path;
};

API_Services.prototype.realTimeWeather = function(req, res) {
    res.status(501).send("It works!");
};

module.exports = new API_Services();