
// TODO: master logic
var userID = {};
var socketToWorker = {};

module.exports = function (workers, cluster) {

    require("./lib/proxy_server.js")(workers);
    
    cluster.on("message", function (worker, mess) {
        if (mess.cmd === "chat message") {
            console.log("chat message");
            if (!userID[mess.id])
                userID[mess.id] = mess.username;
            if (userID[mess.id] !== mess.username)
                userID[mess.id] = mess.username;
            for (let pid in workers) {
                // invio il messaggio a tutti tranne il processo che ha inviato il messaggio.
                if (pid != mess.pid)
                {
                    workers[pid].send(mess);
                }
            }
        }
        else if (mess.cmd === "new user connected") {
            console.log("new user connected");
            userID[mess.id] = "Ghost";
            for (let pid in workers) {
                if (pid != mess.pid)
                    workers[pid].send(mess);
            }
        }
        else if (mess.cmd === "get users connected") {
            console.log("get user connected");
            mess.userID = userID;
            workers[mess.pid].send(mess);
        }
        else if (mess.cmd === "disconnect") {
            console.log("disconnect");
            delete userID[mess.id];
            for (let pid in workers) {
                if (pid != mess.pid)
                    workers[pid].send(mess);
            }
        }



    });

}