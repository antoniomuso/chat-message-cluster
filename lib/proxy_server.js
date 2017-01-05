module.exports = function (workers) {
    var http_proxy = require("http-proxy");
    var http = require("http");


    var proxy = http_proxy.createProxyServer();

    var i = 0;
    var server = http.createServer(function (req, res) {
        var worker = workers[Object.keys(workers)[i]];
        proxy.web(req, res, { target: 'http://localhost:' + worker.port });
        console.log ("http request responce " + worker.port );
    });


    server.on('upgrade', function (req, socket, head) {
        console.log("gestito richiesta");
        var worker = workers[Object.keys(workers)[i]];
        proxy.ws(req, socket, head, { target: 'http://localhost:' + worker.port });
        i = (i + 1) % Object.keys(workers).length;
    });

    server.listen(require("./../config.json").server_port);
}