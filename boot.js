// Clustering to exploit all the cores of a machine. Node is single-threaded so it will use by default only 1 core.
var cluster = require("cluster");
var debug = console.log;
// per risolvere il problema bisogna trovare un approccio in modo tale che ogni cliente venga gestito sempre dallo stesso processo.
//cluster.schedulingPolicy = cluster.SCHED_NONE;

if (cluster.isMaster) { // Master process
    var environment = process.env.NODE_ENV || 'development'; // production to use express built-in cache middleware
    debug('Running in %s environment', environment);

    var numCPUs = require("os").cpus().length;
    port = 2000;
    var workers = {};
    for (var i = 0; i < numCPUs; i++) {
        
        worker = cluster.fork({env: "" + port}); // 1 process per core
        workers[worker.process.pid] = worker;
        workers[worker.process.pid].port = port;        
        port++;
    }
 
    debug('Master process online with PID', process.pid);
 
    cluster.on('exit', function(worker, code, signal) {
        debug('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        debug('Starting a new worker');
        workernew = cluster.fork({env:""+ workers[worker.process.pid].port}); // 1 process per core
        workers[workernew.process.pid] = workernew;
        workers[workernew.process.pid].port = workers[worker.process.pid].port;
        delete workers[worker.process.pid];
    });

    require('./master.js')(workers, cluster);
 
} else { // Worker process
    require('./worker.js')();
}

