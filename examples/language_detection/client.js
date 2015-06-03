#!/usr/bin/node

/*
 * This service detects the language of the sentences read from a text file
*/

// client
var fs = require('fs'),
    services = require('node-services'),
    client = services.createClient({name: "Language Detection", host: "127.0.0.1", port: 5433});

fs.readFile("sentences.txt", function(err, f){
    if(err) {
        console.log("ERROR OPENING FILE!");
        process.exit(1);
    }
    var array = f.toString().split('\n');
    array.pop();

    array.forEach(function(sentence) {
        client.run(sentence, function(result) {
            console.log(result.toString());
        });
    });
});
