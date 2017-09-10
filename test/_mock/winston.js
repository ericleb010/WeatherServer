let logCounts;

let levels = ["emerg", "alert", "crit", "err", "warning", "notice", "info", "debug"];

function resetCounts() {
    logCounts = {
        emerg: 0,
        alert: 0,
        crit: 0,
        err: 0, 
        warning: 0, 
        notice: 0, 
        info: 0,
        debug: 0
    };
}

module.exports = {

    // If logLevel is a number, return the sum of all logs above that log level.
    // If it is a string instead, return just that level's count.
    // If it is not provided, return the whole array (for debugging purposes).
    getLogCounts: function(logLevel) {
        if (typeof logLevel === "number") {
            return levels.reduce(function(prev, curr, i) {
                return (i <= logLevel) ? prev + logCounts[curr] : prev;
            }, 0);
        }
        return !logLevel ? logCounts : logCounts[logLevel]
    },
    clearLogs: resetCounts,

    emerg: () => logCounts["emerg"]++,
    alert: () => logCounts["alert"]++,
    crit: () => logCounts["crit"]++,
    err: () => logCounts["err"]++,
    warning: () => logCounts["warning"]++,
    notice: () => logCounts["notice"]++,
    info: () => logCounts["info"]++,
    debug: () => logCounts["debug"]++
}