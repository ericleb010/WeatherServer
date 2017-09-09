let expect = require("chai").expect;
let mock = require("mock-require");
let mockHttp = require("nock");

require("../setup.js");

let logger = require("../_mock/winston.js");
let utils;

before(function() {
    mock("winston", "../_mock/winston.js");
    utils = require("../../server/utils.js");
});

beforeEach(function() {
    logger.clearLogCounts();
})

describe("Utils Unit Test Suite", function() {

    describe("(sendRequestForWeather)", function() {

        describe("Testing required arguments:", function() {

            describe("Valid requests --", function() {

                beforeEach(function() {
                    mockHttp("http://www.example.com").get("/weather").reply(200, { data: "OK" });
                });

                it("should not error when serviceKey and a valid url are provided", function(done) {
                    let data = utils.sendRequestForWeather("A", "http://www.example.com/weather");

                    data.then(function() {
                        expect(logger.getLogCounts("err")).to.equal(0);
                        expect(logger.getLogCounts("debug")).to.equal(1);
                        done();
                    });

                    expect(data).to.eventually.equal('{"data":"OK"}');
                });
            });
        });
    });
});