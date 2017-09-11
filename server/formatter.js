let logger = require("winston");

function Formatter() {
    function standardResponse(data, status) {
        return {
            "status": status || 200,
            "data": data || {}
        };
    }

    this.sendStandardData = function(req, res) {
        let payload;

        if (res.errorCode && typeof res.errorCode !== 'number') {
            logger.err("Invalid, non-integer errorCode provided: %s", res.errorCode);
            res.errorCode = null;
        }

        if (!res.success) {
            payload = standardResponse(res.data, res.errorCode || 500);
            if (res.error) {
                if (res.error instanceof Error) {
                    payload.error = res.error.message;
                }
                else {
                    logger.warning("Passed in res.error, but was not an Error object: %s", res.error);
                }
            }
        }
        else {
            payload = standardResponse(res.data, res.errorCode);
        }

        logger.debug("Payload: %j", payload, {});
        res.json(payload);
    }
}

module.exports = new Formatter();