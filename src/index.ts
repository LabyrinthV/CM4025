import express from "express"
import path from "node:path"

const app = express();

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.get("/", function(req, res){
    res.render('pages/Calculator');
});

app.listen(8080);

