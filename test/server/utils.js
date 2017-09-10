/* eslint-disable no-undef */

let mock = require("mock-require");
let mockHttp = require("nock");

let logger = require("../_mock/winston.js");
require("../setup.js");
let utils;

before(function() {
    mock("winston", "../_mock/winston.js");
    utils = require("../../server/utils.js");
});

beforeEach(function() {
    logger.clearLogs();
})

describe("Utils Unit Test Suite", function() {

    describe("(sendRequestForWeather)", function() {

        describe("Testing required arguments:", function() {

            describe("Valid inputs", function() {

                beforeEach(function() {
                    mockHttp("http://www.example.com").get("/weather").reply(200, { data: "OK" });
                });

                it("should not cause an error when serviceKey and a valid url are provided", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/weather");

                    data.then(function() {
                        expect(logger.getLogCounts(3)).to.equal(0);
                        expect(logger.getLogCounts("debug")).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.equal('{"data":"OK"}');
                });

                it("should not cause an error when serviceKey is an empty string", function(done) {
                    let data = utils.sendRequestForWeather("", "http://www.example.com/weather");
                    
                    data.then(function() {
                        expect(logger.getLogCounts(3)).to.equal(0);
                        expect(logger.getLogCounts("debug")).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.equal('{"data":"OK"}');
                });
            });

            describe("Unexpected responses", function() {

                before(function() {
                    mockHttp("http://www.example.com").get("/weatherJunk").reply(200, '"ton of junk":3}', { "content-type": "application/json" });
                    mockHttp("http://www.example.com").get("/weather").reply(503);
                    mockHttp("http://www.example.com").get("/weatherNotFound").reply(404);
                    mockHttp("http://www.example.com").get("/weatherBroken").replyWithError({message: "Failure", code: "ERROR"});
                    mockHttp("http://www.example.com").get("/a.html").reply(200, "<html></html>", { "content-type": "text/html" });
                });

                it("like junk JSON data, should not throw an error", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/weatherJunk");
                    
                    data.then(function() {
                        expect(logger.getLogCounts(3)).to.equal(0);
                        expect(logger.getLogCounts("debug")).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.equal('"ton of junk":3}');
                });

                it("like from an overloaded server, should fail", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/weather");
                    
                    data.catch(function() {
                        expect(logger.getLogCounts("warning")).to.equal(1);
                        expect(logger.getLogCounts(7)).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.be.rejected;
                });

                it("like from an unknown endpoint, should fail", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/weatherNotFound");
                    
                    data.catch(function() {
                        expect(logger.getLogCounts("alert")).to.equal(1);
                        expect(logger.getLogCounts(7)).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.be.rejected;
                });

                it("like from a down host, should fail", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/weatherBroken");
                    
                    data.catch(function() {
                        expect(logger.getLogCounts("err")).to.equal(1);
                        expect(logger.getLogCounts(7)).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.be.rejected;
                });

                it("like from an unexpected response type, should fail", function(done) {
                    let data = utils.sendRequestForWeather("ABC", "http://www.example.com/a.html");
                    
                    data.catch(function() {
                        expect(logger.getLogCounts("alert")).to.equal(1);
                        expect(logger.getLogCounts(7)).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.be.rejected;
                });
            });

            describe("Invalid inputs", function() {

                it("should throw an error when serviceKey is not a string", function() {
                    expect(() => utils.sendRequestForWeather(34, "http://www.example.com/weather")).to.throw(utils.ParameterError);
                });

                it("should throw an error when url is not a string", function() {
                    expect(() => utils.sendRequestForWeather("ABC", {})).to.throw(utils.ParameterError);
                });
            });
        });
    });
});