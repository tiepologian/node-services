#!/usr/bin/node

// worker
var services = require('node-services'),
    worker = services.createWorker({name: "Square root", host: "localhost", port: 5433, workers: 2});

worker.pre(function() {
    // load bulky modules here or do heavy initialization work
    console.log("Worker ready - waiting for jobs");
});

worker.post(function() {
    // cleanup before shutting down service
    console.log("Shutting down service");
});

worker.work(function(data) {
    var numberData = parseInt(data);
    // return JSON obj containing original number, sqrt and process id
    return JSON.stringify({data: numberData, result:Math.sqrt(numberData).toFixed(2), pid: process.pid});
});
