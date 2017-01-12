var app = require("express")();

app.use("/static",require("express").static('css'));
app.use("/bootstrap",require("express").static('./lib/bootstrap-3.3.7/dist'));

app.get("/", function(req,res){
    res.sendFile(__dirname +"/index.html");
});



module.exports = app;