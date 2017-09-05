
function Formatter() {
    function standardResponse(data, status) {
        return {
            "status": status || 200,
            "data": data || {}
        };
    }

    this.sendStandardData = function(req, res) {
        let payload;
        res.type('application/json');
        if (res.success) {
            res.status(res.errorCode);
            payload = standardResponse(res.data, res.errorCode);
            payload.error = res.error.message;
        }
        else {
            payload = standardResponse
        }
        res.send(payload);
    }
}

module.exports = new Formatter();