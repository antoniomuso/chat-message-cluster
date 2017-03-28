var path = require("path")
var app = require('./lib/app.js');
var http = require("http").Server(app);
var https = require("https").createServer({
    key: require("fs").readFileSync(path.join(__dirname, "/ssl/private-key.pem")),
    cert: require("fs").readFileSync(path.join(__dirname, "/ssl/public-cert.pem"))
}, app)
var io = require("socket.io")(https);


io.on("connection", function (socket) {
    console.log("Socket created");
    console.log("worker with port " + process.env.env + " socket id: " + socket.id + " ")

    // Messaggio di collegamente di un utente.

    process.send({ cmd: 'new user connected', username: "Ghost", pid: process.pid, id: socket.id });
    console.log("message send");
    socket.broadcast.emit("new user connected", "Ghost", socket.id);


    socket.emit('log', 'Process serving the request: ' + process.pid);

    process.send({ cmd: 'get users connected', pid: process.pid, id: socket.id });

    var spam = false; // evita lo spam
    socket.on("chat message", function (message, username) {
        if (!spam) {
            spam = true;
            setTimeout(function () { spam = false }, 500);
            socket.emit('log', 'Process serving the request: ' + process.pid);
            socket.broadcast.emit("chat message", message, username, socket.id);
            // send a mex to the master
            process.send({ cmd: 'chat message', payload: message, username: username, pid: process.pid, id: socket.id });
        }
        else {
            socket.emit("error message", { type: "spam", message: "You are spamming, your message wasn't sent " });
        }
    });

    socket.on("disconnect", function () {
        process.send({ cmd: 'disconnect', pid: process.pid, id: socket.id });
        socket.emit('log', 'Process serving the request: ' + process.pid);
        socket.broadcast.emit("user disconnected", socket.id);
        console.log("socket disconetted");
    });


});

// Messaggi di risposta dal master.
process.on("message", function (message) {
    // receive a mex from the master
    if (message.cmd === "chat message") {
        io.sockets.emit("chat message", message.payload, message.username, message.id);
        console.log(message);
    }
    else if (message.cmd === "new user connected") {
        io.sockets.emit("new user connected", message.username, message.id);

    }
    else if (message.cmd === "get users connected") {
        if (io.sockets.connected[message.id]) {
            io.sockets.connected[message.id].emit('get users connected', message.userID);
        }
    }
    else if (message.cmd === "disconnect") {
        io.sockets.emit("user disconnected", message.id);
    }


});
// HTTP
http.listen(parseInt(80), function () {
    console.log("listening on " + 80 + " Worker");
});

// HTTPS


https.listen(433, function () {
    console.log("listening on 433 Master");
});





