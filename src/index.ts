import express from "express"
import path from "node:path"

const app = express();

app.use(express.static(path.join(__dirname, "/public")))

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.get("/", function(req, res){
    res.render('pages/Calculator');
});

app.post("/Calculator", function(req, res){

    console.log(req.body)
    res.json({
        
    });
})

app.listen(8080);

