module.exports = function (workers) {
    var http_proxy = require("http-proxy");
    var http = require("http");


    var proxy = http_proxy.createProxyServer();

    var socketIDtoPort = {};
    var i = 0;
    var server = http.createServer(function (req, res) {
        var worker = workers[Object.keys(workers)[i]];
        proxy.web(req, res, { target: 'http://localhost:' + worker.port });
        console.log ("http request responce " + worker.port );
    });


    server.on('upgrade', function (req, socket, head) {
        console.log(req.headers["sec-websocket-key"]);
        if (socketIDtoPort[req.headers["sec-websocket-key"]]) {
            proxy.ws(req, socket, head, { target: 'http://localhost:' + socketIDtoPort[req.headers["sec-websocket-key"]] });
            console.log("Server responce to: " + socketIDtoPort[req.headers["sec-websocket-key"]] + " with id ");
        }
        else {
            var worker = workers[Object.keys(workers)[i]];
            socketIDtoPort[req.headers["sec-websocket-key"]] = worker.port;

            proxy.ws(req, socket, head, { target: 'http://localhost:' + worker.port });
            console.log("Server create to: " + socketIDtoPort[req.headers["sec-websocket-key"]] + " with id ");
        }
        i = (i + 1) % Object.keys(workers).length;

    });

    server.listen(8000);
}
