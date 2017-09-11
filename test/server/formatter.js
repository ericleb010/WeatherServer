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
        describe("Valid inputs", function() {
            it("should send a standard data object with data", function() {
                res.data = { msg: "OK" };

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":200,"data":{"msg":"OK"}}')
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send a standard data object without expecting data", function() {
                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":200,"data":{}}')
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });

            it("should send an object with the correct status", function() {
                res.errorCode = 204;

                formatter.sendStandardData(req, res);
                expect(res.getSentData()).to.equal('{"status":204,"data":{}}')
                expect(logger.getLogCounts("debug")).to.equal(1);
                expect(logger.getLogCounts(7)).to.equal(1);
            });
        });
    });
});