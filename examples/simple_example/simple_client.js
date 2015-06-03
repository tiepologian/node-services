#!/usr/bin/node

/*
 * This service calculates the square root of the number provided as input
*/

// client
var services = require('node-services'),
    client = services.createClient({name: "Square root", host: "127.0.0.1", port: 5433});

var myNumbers = [1045, 4668, 3, 4496, 1432, 2154, 4734, 2668, 143, 3387];

myNumbers.forEach(function(num) {
    client.run(num, function(result) {
	var resultObj = JSON.parse(result);
        console.log("Square root of", resultObj.data, "is", resultObj.result, "(pid "+resultObj.pid+")");
    });
});
