function newReq() {
    return {};
}

function newRes() {
    let response;
    
    return {
        getSentData: () => response,

        success: true,
        json: (data) => response = JSON.stringify(data)
    };
}

module.exports = {
    newDemand: function() {
        return [newReq(), newRes()];
    }
}