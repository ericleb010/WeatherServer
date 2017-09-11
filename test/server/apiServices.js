let mock = require("mock-require");

let logger = require("../_mock/winston.js");
let express = require("../_mock/express.js");
let apiServices;

let req, res, next;

before(function() {
    require("../setup.js");
    mock("winston", "../_mock/winston.js");
    mock("express", "../_mock/express.js");
    apiServices = require("../../server/apiServices.js");
});

beforeEach(function() {
    let params = express.newDemand();
    req = params[0];
    res = params[1];
    next = params[2];

    logger.clearLogs();
});

describe("API Services Test Suite", function() {
    describe("(heartbeat)", function() {
        describe("Valid calls", function() {
            it("can be made using bare input", function() {
                apiServices.heartbeat(req, res, next);

                expect(res.data).to.deep.equal({ status: "OK" });
                expect(res.errorCode).to.equal(200);
                expect(res.success).to.be.true;
                expect(logger.getLogCounts(7)).to.equal(0);
            });

            it("will have overwritten data if we try to provide non-error input", function() {
                res.data = { message: "Hello" };
                res.errorCode = 206;

                apiServices.heartbeat(req, res, next);

                expect(res.data).to.deep.equal({ status: "OK" });
                expect(res.errorCode).to.equal(200);
                expect(res.success).to.be.true;
                expect(logger.getLogCounts(7)).to.equal(0);
            });

            it("will have overwritten data if we try to provide error input", function() {
                res.success = false;
                res.errorCode = 500;
                res.error = new Error("An error has occurred");

                apiServices.heartbeat(req, res, next);

                expect(res.data).to.deep.equal({ status: "OK" });
                expect(res.errorCode).to.equal(200);
                expect(res.success).to.be.true;
                expect(logger.getLogCounts(7)).to.equal(0);
            });
        });
    });
});