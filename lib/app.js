var app = require("express")();

app.use("/static",require("express").static('css'));

app.get("/", function(req,res){
    res.sendFile(__dirname +"/index.html");
});



module.exports = app;