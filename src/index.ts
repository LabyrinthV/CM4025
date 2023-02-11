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
    let loggedin = req.session.loggedin;
    res.render('pages/Calculator', {loggedin});
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

        let uname = req.session.currentuser;
 
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

// Post routes

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

app.post("/SignIn", express.urlencoded({extended:true}), async function(req, res){
    let uname = req.body.username;
    let pword = req.body.password;

    const user = await db.db('quotesdb').collection('users').findOne({username: uname, password: pword})
    if (!user) {
        res.status(401).send('User not found')
        return;
    }
    req.session.loggedin = true;
    req.session.currentuser = uname;
    res.redirect('/Calculator');
});

app.post("/SignUp", express.urlencoded({extended:true}), async function(req, res){
    let data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        name: req.body.name,
        quotes: []
    };
    await db.db('quotesdb').collection('users').insertOne(data);
    console.log("User created");
    res.redirect('/Account');
});

app.post("/AddToQuotes", express.urlencoded({extended:true}), async function(req, res){
    if (!req.session.loggedin) { return; }
    let uname = req.session.currentuser;




mongoClient.connect().then((client) => {
    console.log("Mongo Connected")
    app.listen(8080);
    db=client
})
