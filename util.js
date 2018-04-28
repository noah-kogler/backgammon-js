const DEBUG_MODE = true;

let Log = {};

Log.debugMsg = function (msg) {
    if (DEBUG_MODE) {
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