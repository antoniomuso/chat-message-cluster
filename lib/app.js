var app = require("express")();

app.use("/bootstrap",require("express").static('./lib/bootstrap-3.3.7/dist'));

app.get("/", function(req,res){
    res.sendFile(__dirname +"/index.html");
});



module.exports = app;