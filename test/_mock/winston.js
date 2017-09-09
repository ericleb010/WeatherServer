let count;

function resetCounts() {
    count = {
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
    getLogCounts: (level) => count[level],
    clearLogCounts: resetCounts,

    emerg: () => count["emerg"]++,
    alert: () => count["alert"]++,
    crit: () => count["crit"]++,
    err: () => count["err"]++,
    warning: () => count["warning"]++,
    notice: () => count["notice"]++,
    info: () => count["info"]++,
    debug: () => count["debug"]++
}