const {setGlobalOptions} = require("firebase-functions/v2");

const bcbFunctions = require("./bcb");
const transactionFunctions = require("./transactions");

setGlobalOptions({maxInstances: 10});

exports.brapi = require("./brapi");
exports.bcb = bcbFunctions;
exports.transactions = transactionFunctions;

