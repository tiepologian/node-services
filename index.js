var zmq = require('zmq');
var fs = require('fs');

// Constructor
function Worker(conf) {
    this.responder = zmq.socket('rep');
    this.cluster = require('cluster');
    this.serviceName = conf.name;
    this.numProc = conf.workers;
    this.connectionString = "tcp://" + conf.host.toString() + ":" + conf.port;
    this.ipcString = "ipc://node-service.ipc";
    this.cb;
    this.preCb;
    this.postCb;
    if(this.cluster.isMaster) {
	// master process, create ROUTER and DEALER
	this.router = zmq.socket('router').bind(this.connectionString);
	this.dealer = zmq.socket('dealer').bind(this.ipcString);

	var self = this;
	// forward messages between router and dealer
	this.router.on('message', function() {
	    var frames = Array.prototype.slice.call(arguments);
	    self.dealer.send(frames);
	});

	this.dealer.on('message', function() {
	    var frames = Array.prototype.slice.call(arguments);
	    self.router.send(frames);
	});

	// listen for workers to come online
	this.cluster.on('online', function(worker) {
	    console.log('Worker ' + worker.process.pid + ' is online.');
	});

	// fork three worker processes
	for (var i = 0; i < this.numProc; i++) {
	    this.cluster.fork();
	}
    }
    else {
	// worker process, create REP
	this.responder.connect(this.ipcString);
    }
}

// class methods
Worker.prototype.pre = function(callMe) {
    this.preCb = callMe;
};

Worker.prototype.post = function(callMe) {
    this.postCb = callMe;
};

Worker.prototype.work = function(callMe) {
    if(this.cluster.isMaster) return;
    // call pre function
    this.preCb();
    
    // save a reference to this
    var self = this;

    // handle incoming requests
    this.responder.on('message', function(data) {
        // parse incoming message
	callMe(data, function(toSend) {
	    self.responder.send(toSend);
        });
    });

    // close the responder when the Node process ends
    process.on('SIGINT', function() {
	// clean up
        self.responder.close();
	var ipcFile = process.cwd()+"/node-service.ipc";
	if(fs.existsSync(ipcFile)) fs.unlinkSync(ipcFile);
	// call post function
        if (self.postCb != undefined) self.postCb();
    });
}

// Constructor
function Client(conf) {
    this.serviceName = conf.name;
    this.connectionString = "tcp://" + conf.host + ":" + conf.port.toString();
}

Client.prototype.run = function(data, cb) {
    var aClient = new TcpClient(this.connectionString);
    aClient.sendMessage(data, cb);
};

// Constructor for TCP client
function TcpClient(cnx) {
    this.requester = zmq.socket('req');
    this.requester.connect(cnx);
}

TcpClient.prototype.sendMessage = function(data, cb) {
    var self = this;
    this.requester.on("message", function(res) {
        var response = res.toString();
	self.requester.close();
        cb(response);
    });
    this.requester.send(data);
}

exports.createWorker = function(conf) {
    var worker = new Worker(conf);
    return worker;
}

exports.createClient = function(conf) {
    var client = new Client(conf);
    return client;
}
