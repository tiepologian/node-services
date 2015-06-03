#!/usr/bin/node

/*
 * This service detects the language of the sentences read from a text file
*/


// worker
var services = require('node-services'),
    worker = services.createWorker({name: "Language detection", host: "127.0.0.1", port: 5433, workers: 3});

var lngDetector;

worker.pre(function() {
    lngDetector = new (require('languagedetect'));
});

worker.post(function() {
    // cleanup before shutting down service
    console.log("Shutting down service");
});

worker.work(function(data, done) {
    var result = lngDetector.detect(data.toString());
    if(result != undefined) done(result[0][0]);
    else done("undefined");
});
