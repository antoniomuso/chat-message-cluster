module.exports = function (workers) {
    var http_proxy = require("http-proxy");
    var http = require("http");


    var proxy = http_proxy.createProxyServer();

    var socketIDtoPort = {};
    var i = 0;
    var server = http.createServer(function (req, res) {
        if (socketIDtoPort[req.headers.cookie] ) {
            
            //console.log(socketIDtoPort[req.headers.cookie]);
            proxy.web(req, res, { target: 'http://localhost:' + socketIDtoPort[req.headers.cookie] });
            console.log("Server responce: " + socketIDtoPort[req.headers.cookie] + " with id "+ req.headers.cookie);
        }
        else {
            console.log("non websocket");
            var worker = workers[Object.keys(workers)[i]];
            socketIDtoPort[req.headers.cookie] = worker.port;
            proxy.web(req, res, { target: 'http://localhost:' + worker.port });
            console.log("Server create to: " + socketIDtoPort[req.headers.cookie] + " with id "+ req.headers.cookie);

        }
        i = (i + 1) % Object.keys(workers).length;
    });

    
    server.on('upgrade', function (req, socket, head) {
        console.log(socket.id);
        if (socketIDtoPort[req.headers.cookie] )
        {
            proxy.ws(req, socket, head, { target: 'http://localhost:' + socketIDtoPort[req.headers.cookie] });
            console.log("Server responce to: " + socketIDtoPort[req.headers.cookie] + " with id "+ req.headers.cookie);
        }
        else {
            var worker = workers[Object.keys(workers)[i]];
            socketIDtoPort[req.headers.cookie] = worker.port;

            proxy.ws(req, socket, head, { target: 'http://localhost:' + worker.port });
            console.log("Server create to: " + socketIDtoPort[req.headers.cookie] + " with id "+ req.headers.cookie);
        }
        i = (i + 1) % Object.keys(workers).length;
        
    });

    server.listen(8000);
}
