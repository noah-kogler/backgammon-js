let Log = {
    debugMode: true,
};

Log.debugMsg = function (msg) {
    if (Log.debugMode) {
        console.log(msg);
    }
};

Log.errorMsg = function (msg) {
    console.error(msg);
};


let DataManipulation = {};

// This doesn't preserve type-information and non-derializable attributes.
DataManipulation.deepCopy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
};