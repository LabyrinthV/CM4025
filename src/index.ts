import express from "express"
import path from "node:path"
import { calculateBudget } from "./classes/calculator";

const app = express();

app.use(express.static(path.join(__dirname, "/public")))

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

app.get("/", function(req, res){
    res.render('pages/Calculator');
});

app.post("/Calculator", express.urlencoded({extended:true}), function(req, res){

    const formData = {
        time: parseInt(req.body.time),
        period: req.body.period,
        payGrade: req.body.payGrade,
        ongoingCosts: parseInt(req.body.ongoingCosts),
        frequency: req.body.frequency,
        oneOffCost: parseInt(req.body.oneOffCost)
    }
    console.log(formData)
    let finalBudget = calculateBudget(formData)

    res.json({
        finalBudget
    });
})

app.listen(8080);
