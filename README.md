# node-services
Node.js module for client/worker services

### Requirements
- ØMQ (development)
```
sudo apt-get install libzmq3-dev
```

### Installation
```
sudo npm install node-services
```

### Usage example
Worker:
```js
// worker
var services = require('node-services'),
    worker = services.createWorker({name: "Square root", host: "127.0.0.1", port: 5433, workers: 2});

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
```

Client:
```js
#!/usr/bin/node

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
```

This example creates a service that calculates square roots.
Start the worker in a new screen:
```
screen
nodejs simple_worker.js
```

And run the client:
```
nodejs simple_client.js

Square root of 1045 is 32.33 (pid 14474)
Square root of 4668 is 68.32 (pid 14476)
Square root of 3 is 1.73 (pid 14474)
Square root of 4496 is 67.05 (pid 14476)
Square root of 1432 is 37.84 (pid 14474)
Square root of 4734 is 68.80 (pid 14474)
Square root of 143 is 11.96 (pid 14474)
Square root of 2154 is 46.41 (pid 14476)
Square root of 2668 is 51.65 (pid 14476)
Square root of 3387 is 58.20 (pid 14476)
```

The client sends 10 requests to the service provider that balances the jobs between two workers.

### API

Coming soon
