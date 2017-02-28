let server = require("express")();
let config = require("../config/server_config.js");
let api = require("./api_services.js");


// Define routes for the API
server.get(api.realTimePath, api.realTimeWeather);


console.log("\nNow listening on port " + config.PORT + "...");
console.log("Press CTRL+C to exit.");
server.listen(config.PORT);

// TEST
// http.get("http://api.openweathermap.org/data/2.5/weather?id=5992996&APPID=" + apiKeys[0], function(res) {
//     let data = "";
//     res.on('data', d => data += d );
//     res.on('end', d => console.log(JSON.parse(data)));
// });