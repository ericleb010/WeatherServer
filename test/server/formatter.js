let mock = require("mock-require");

let logger = require("../_mock/winston.js");
let express = require("../_mock/express.js");
let formatter;

let req, res;

before(function() {
    require("../setup.js");
    mock("winston", "../_mock/winston.js");
    formatter = require("../../server/formatter.js");
});

beforeEach(function() {
    let params = express.newDemand();
    req = params[0];
    res = params[1];

    logger.clearLogs();
});

describe("Formatter Test Suite", function() {
    describe("(sendStandardData)", function() {
        describe("Valid, non-error inputs", function() {
            it("should send a standard data object with data", function() {
                res.data = { msg: "OK" };

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":200,"data":{"msg":"OK"}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send a standard data object without expecting data", function() {
                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":200,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send an object with the correct status", function() {
                res.errorCode = 204;

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":204,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });
        });

        describe("Valid, error inputs", function() {
            it("should send a standard data object with data", function() {
                res.success = false;
                res.data = { msg: "ERROR" };

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":500,"data":{"msg":"ERROR"}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send a standard data object without expecting data", function() {
                res.success = false;

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":500,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send an object with the correct status", function() {
                res.success = false;
                res.errorCode = 503;

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":503,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send a standard data object with an error message if an error object is provided", function() {
                res.success = false;
                res.errorCode = 500;
                res.error = new Error("Encountered an error");

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":500,"data":{},"error":"Encountered an error"}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send a standard data object without an error message if a non-Error object error is provided", function() {
                res.success = false;
                res.errorCode = 500;
                res.error = "Encountered an error";

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":500,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts("warning")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(2);
            });
        });

        describe("Invalid inputs", function() {
            it("such as non-integer, non-error status codes should log an error and default to 200", function() {
                res.errorCode = "ERROR";
                
                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":200,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts("err")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(2);
            });

            it("such as non-integer, error status codes should log an error and default to 500", function() {
                res.errorCode = "ERROR";
                res.success = false;
                
                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":500,"data":{}}');
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts("err")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(2);
            });
        })
    });
});