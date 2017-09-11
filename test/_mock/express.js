let req, res, response;

// If next() was called, returns the state of req and res objects.
// If not, then this is the last middleware and the res.data object is returned.
let returnResponse = () => response;

function newReq() {
    return req = {
        getData: returnResponse
    };
}

function newRes() {  
    return res = {
        getSentData: returnResponse,

        success: true,
        json: (data) => response = JSON.stringify(data)
    };
}

let next = () => response = { req: req, res: res };

module.exports = {
    newDemand: function() {
        return [newReq(), newRes(), next];
    }
}