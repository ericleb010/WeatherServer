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

        if (!res.success) {
            payload = standardResponse(res.data, res.errorCode || 500);
            if (res.error) {
                payload.error = res.error.message;
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