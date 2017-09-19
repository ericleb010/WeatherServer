let mock = require("mock-require");

require("./utils.js"); // To ensure test order.
let logger = require("../_mock/winston.js");
let express = require("../_mock/express.js");
let apiServices;

let req, res, next, config;

before(function() {
    require("../setup.js");
    mock("winston", "../_mock/winston.js");
    mock("express", "../_mock/express.js");
    mock("../../server/utils.js", "../_mock/utils.js");
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

    describe("(realTimeWeather)", function() {
        beforeEach(function() {
            config = {
                DEFAULT_LOCATION: "A1"
            }
            req.config = config;
        });

        describe("Valid calls", function() {
            describe("with a number of defined service providers,", function() {
                beforeEach(function() {
                    config["SP_TYPES"] = ["FOO", "BAR", "BAZ"];
                    config["API_KEYS"] = {
                        "FOO": "foobar",
                        "BAR": "barfoo",
                        "BAZ": "bazzab"
                    };
                    config["API_BASE_URLS"] = {
                        "FOO": "example.com/",
                        "BAR": "example.org/",
                        "BAZ": "example.net/"
                    };
                    config["REAL_TIME_QUERY"] = {
                        "FOO": (loc) => loc,
                        "BAR": (loc) => loc,
                        "BAZ": (loc) => loc
                    };
                });

                describe("but nothing returns", function() {
                    describe("at all,", function() {
                        it("should error", function(done) {
                            req.params.location = "Z0"
                            let promise = apiServices.realTimeWeather(req, res, next);
    
                            promise.then(function() {
                                expect(res.data).to.be.undefined;
                                expect(res.error).to.not.be.undefined;
                                expect(res.errorCode).to.equal(503);
                                expect(res.success).to.be.false;
                                done()
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });

                    describe("in time,", function() {
                        it("should error", function(done) {
                            config["WAIT_TIME_MIN"] = 20;
                            req.params.location = "Z0"
                            let promise = apiServices.realTimeWeather(req, res, next);
    
                            promise.then(function() {
                                expect(res.data).to.be.undefined;
                                expect(res.error).to.not.be.undefined;
                                expect(res.errorCode).to.equal(503);
                                expect(res.success).to.be.false;
                                done()
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                    })
                });

                describe("but no location is specified,", function() {
                    it("will use the default location", function(done) {
                        config["SERVICE_RESPONSES_MIN"] = 2;
                        let promise = apiServices.realTimeWeather(req, res, next);
        
                        promise.then(function() {
                            expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                            expect(res.errorCode).to.be.undefined;
                            expect(res.success).to.be.true;
                            done();
                        });

                        expect(promise).to.eventually.be.fulfilled;
                    });
                });

                describe("but no minimum required responses,", function() {
                    beforeEach(function() {
                        config["SERVICE_RESPONSES_MIN"] = 0;
                    });

                    it("should treat the minimum as 1", function(done) {
                        req.params.location = "A0";
                        let promise = apiServices.realTimeWeather(req, res, next);
                        
                        promise.then(function() {
                            expect(res.data).to.deep.equal({"priority": 3, "service": "BAZ", "data": '{"data":"OK"}'});
                            expect(res.errorCode).to.be.undefined;
                            expect(res.success).to.be.true;
                            done();
                        });

                        expect(promise).to.eventually.be.fulfilled;
                    });
                });

                describe("a lesser number of minimum required responses,", function() {
                    beforeEach(function() {
                        config["SERVICE_RESPONSES_MIN"] = 2;
                    });

                    describe("and no minimum wait time,", function() {
                        it("should return the highest priority of the responses that return first", function(done) {
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
    
                        it("should return the highest priority of the responses when one errors out", function(done) {
                            req.params.location = "A2";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should return the highest priority of the responses when it can't return the minimum", function(done) {
                            req.params.location = "A3";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });

                    describe("and a minimum wait time,", function() {
                        beforeEach(function() {
                            config["WAIT_TIME_MIN"] = 20;
                        });

                        it("should return highest priority response of the responses that return on time", function(done) {
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
    
                        it("should return highest priority response if one errors out", function(done) {
                            req.params.location = "A2";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should wait past the minimum wait time if a minimum number have not returned", function(done) {
                            req.params.location = "A4";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should wait past the minimum wait time if a minimum number cannot return", function(done) {
                            req.params.location = "A5";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });
                });

                describe("the same number of minimum required responses,", function() {
                    beforeEach(function() {
                        config["SERVICE_RESPONSES_MIN"] = 3;
                    });

                    describe("and no minimum wait time,", function() {
                        it("should return the highest priority of the responses", function(done) {
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should return the highest priority of the responses when it can't return the minimum", function(done) {
                            req.params.location = "A6";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 2, "service": "BAR", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });

                    describe("and a minimum wait time,", function() {
                        beforeEach(function() {
                            config["WAIT_TIME_MIN"] = 20;
                        });

                        it("should return the highest priority of the responses", function(done) {
                            req.params.location = "A8";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should wait past the minimum wait time if a minimum number have not returned", function(done) {
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });

                        it("should wait past the minimum wait time if a minimum number cannot return", function(done) {
                            req.params.location = "A7";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });
                });

                describe("a larger number of minimum required responses,", function() {
                    beforeEach(function() {
                        config["SERVICE_RESPONSES_MIN"] = 4;
                    });

                    describe("and no minimum wait time,", function() {
                        it("should set minimum required responses to the number of services", function(done) {
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });

                    describe("and a minimum wait time,", function() {
                        it("should wait past the minimum wait time if a minimum number equal to number of services have not returned", function(done) {
                            config["WAIT_TIME_MIN"] = 20;
                            req.params.location = "A1";
                            let promise = apiServices.realTimeWeather(req, res, next);
                            
                            promise.then(function() {
                                expect(res.data).to.deep.equal({"priority": 1, "service": "FOO", "data": '{"data":"OK"}'});
                                expect(res.errorCode).to.be.undefined;
                                expect(res.success).to.be.true;
                                done();
                            });
    
                            expect(promise).to.eventually.be.fulfilled;
                        });
                    });
                });

                describe("but one errors out and one is delayed,", function() {
                    it("should return highest priority response of the responses that return on time", function(done) {
                        config["SP_TYPES"].push("BAB");
                        config["API_KEYS"]["BAB"] = "baobab";
                        config["API_BASE_URLS"]["BAB"] = "example.ca/";
                        config["REAL_TIME_QUERY"]["BAB"] = (loc) => loc;
                        config["SERVICE_RESPONSES_MIN"] = 4;
                        config["WAIT_TIME_MIN"] = 20;

                        req.params.location = "A9";
                        let promise = apiServices.realTimeWeather(req, res, next);

                        promise.then(function() {
                            expect(res.data).to.deep.equal({"priority": 3, "service": "BAZ", "data": '{"data":"OK"}'});
                            expect(res.errorCode).to.be.undefined;
                            expect(res.success).to.be.true;
                            done();
                        });

                        expect(promise).to.eventually.be.fulfilled;
                    });
                });
            });
        });

        describe("Errors", function() {
            let debugFunc = logger.debug;
            
            before(function() {
                delete logger.debug;
            });

            after(function() {
                logger.debug = debugFunc;
            });

            it("should gracefully reject and log rejection", function(done) {
                req.config = {
                    "DEFAULT_LOCATION": "A1",
                    "SP_TYPES": ["FOO", "BAR", "BAZ"],
                    "API_KEYS": {
                        "FOO": "foobar",
                        "BAR": "barfoo",
                        "BAZ": "bazzab"
                    },
                    "API_BASE_URLS": {
                        "FOO": "example.com/",
                        "BAR": "example.org/",
                        "BAZ": "example.net/"
                    },
                    "REAL_TIME_QUERY": {
                        "FOO": (loc) => loc,
                        "BAR": (loc) => loc,
                        "BAZ": (loc) => loc
                    },
                    "SERVICE_RESPONSES_MIN": 4,
                    "WAIT_TIME_MIN": 20
                }

                req.params.location = "Z0";

                let promise = apiServices.realTimeWeather(req, res, next);

                promise.then(function() {
                    expect(res.data).to.be.undefined;
                    expect(res.error).to.not.be.undefined;
                    expect(res.errorCode).to.equal(503);
                    expect(res.success).to.be.false;
                    done()
                });
            });
        });
    });
});