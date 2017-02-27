let server = require("express")();
let http = require("http");
let fs = require('fs');

// Get API key for GET requests
const keySuffix = "_api_key";
const keyTypes = ['OWM'];
const apiKeys = keyTypes.map(type => 
    fs.readFileSync("config/" + type + keySuffix, { encoding: "ascii" }));

http.get("http://api.openweathermap.org/data/2.5/weather?id=5992996&APPID=" + apiKeys[0], function(res) {
    let data = "";
    res.on('data', d => data += d );
    res.on('end', d => console.log(JSON.parse(data)));
});