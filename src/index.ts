import "dotenv/config"
import express from "express"
import express_session from "express-session"
import path from "node:path"
import { MongoClient } from "mongodb"


import { calculateBudget } from "./classes/calculator";

const url = process.env.mongourl ?? ""

const mongoClient = new MongoClient(url)

const app = express();

app.use(express_session({secret:'session'}))

app.use(express.static(path.join(__dirname, "/public")))

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))

let db: MongoClient;



// Get routes

app.get("/", function(req, res){
    res.render('pages/Calculator');
});

app.get("/Account", function(req, res){
    res.render('pages/Account');
});

app.get("/SignIn", function(req, res){
    res.render('pages/SignIn');
});

app.get("/SignUp", function(req, res){
    res.render('pages/SignUp');
});

//Account route
app.get('/Profile', function(req, res){
    //if the user is not logged in redirect them to the login page
    //if(!req.session.loggedin){res.redirect('/SignIn');return;}

    //var uname = req.session.currentuser;
 
    //Find user from database and let express return the result
    // db.collection('people').findOne({"login.username": uname}, function(err, result) {
    //     if (err) throw err;

        

    //     //console.log(JSON.stringify(result));
    //     res.render('pages/Account', {
    //         user: result
    //     })
    // });
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

mongoClient.connect().then((client) => {
    console.log("Mongo Connected")
    app.listen(8080);
    db=client
})
