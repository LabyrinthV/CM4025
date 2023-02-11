import "dotenv/config"
import express from "express"
import express_session from "express-session"
import path from "node:path"
import { MongoClient } from "mongodb"


import { calculateBudget } from "./classes/calculator";

declare module "express-session" {
    interface SessionData {
        user: string;
        currentuser: string;
        loggedin: boolean;
    }
}

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



app.get("/SignIn", function(req, res){
    res.render('pages/SignIn');
});

app.get('/LogOut', function(req, res){
    req.session.loggedin = false;
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Logged out successfully.");
            res.redirect('/Calculator');
        }
    });
});

app.get("/SignUp", function(req, res){
    res.render('pages/SignUp');
});

//Account route
app.get('/Account', async function(req, res){

    //if the user is not logged in redirect them to the login page
    if(req.session) {

        if(!req.session.user){res.redirect('/SignIn');return;}

        var uname = req.session.currentuser;
 
        //Find user from database and let express return the result

        const user = await db.db('quotesdb').collection('users').findOne({"login.username": uname})
        if (!user) {
            res.status(401).send('User not found')
        }
        res.render('pages/Account', {            
            user
        })
    }

    
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
