import "dotenv/config"
import express from "express"
import express_session from "express-session"
import path from "node:path"
import mongoose, { Schema } from 'mongoose';
import User from "./classes/User";
import Quote from "./classes/Quote";
import HourlyRate from "./classes/HourlyRate";
import { calculateBudget } from "./classes/calculator";
import { subtaskForm } from "./types/subtask";

declare module "express-session" {
    interface SessionData {
        user: string;
        currentuser: string;
        loggedin: boolean;
        admin: boolean;
    }
}

const url = process.env.mongourl ?? ""



const app = express();

app.use(express_session({secret:'session',
                        resave: false,
                        saveUninitialized: false}))

app.use(express.static(path.join(__dirname, "/public")))

app.set("view engine", "ejs")

app.set("views", path.join(__dirname, "views"))




// Get routes

app.get("/", function(req, res){
    let loggedin = req.session.loggedin;
    let admin = req.session.admin;
    res.render('pages/Calculator', {loggedin, admin});
});



app.get("/SignIn", function(req, res){
    res.render('pages/SignIn');
});

app.get('/LogOut', function(req, res){
    try {
        req.session.loggedin = false;
    req.session.destroy(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("Logged out successfully.");
            res.redirect('/');
        }
    });
    } catch (error) {
        res.status(500).send('Something broke!');
    }
});

app.get("/SignUp", function(req, res){
    res.render('pages/SignUp');
});

//Account route
app.get('/Account', async function(req, res){
    try {
        let loggedin = req.session.loggedin;
        //if the user is not logged in redirect them to the login page
        if(req.session) {

            if(!req.session.currentuser){res.redirect('/SignIn');return;}

            let uname = req.session.currentuser;
 
            //Find user from database and let express return the result

            const user = await User.findOne({"username": uname})
            if (!user) {
                res.status(401).send('User not found')
            }
            await user?.populate('quotes')
            res.render('pages/Account', {            
                user,
                loggedin
            })
        }
    } catch (error) {
        res.status(500).send('Something broke!');
    }
});

app.get('/ChangeQuote/:id', async function(req, res){
    try {
        let loggedin = req.session.loggedin;
    //if the user is not logged in redirect them to the login page
        if(req.session) {

            if(!req.session.currentuser){res.redirect('/SignIn');return;}

            let uname = req.session.currentuser;

            //Find user from database and let express return the result
            const user = await User.findOne({"username": uname})
            if (!user) {
                res.status(401).send('User not found')
            }

            let quote = await Quote.findById(req.params.id)
            if (!quote) {
                res.status(401).send('Quote not found')
            }
            console.log(quote  )
            res.render('pages/ChangeQuote', {
                quote,
                loggedin
            })
        }
    } catch (error) {
        res.status(500).send('Something broke!');
    }
});

app.get('/DeleteQuote/:id', async function(req, res){
    try {
        let loggedin = req.session.loggedin;
    //if the user is not logged in redirect them to the login page
        if(req.session) {

            if(!req.session.currentuser){res.redirect('/SignIn');return;}

            let uname = req.session.currentuser;

            //Find user from database and let express return the result
            const user = await User.findOne({"username": uname})
            if (!user) {
                res.status(401).send('User not found')
            }
            //Delete quote from database
            await Quote.findByIdAndDelete(req.params.id)
            res.status(200)
            res.redirect('/Account')

        }    
    } catch (error) {
        res.status(500).send('Could not delete quote');
    }
});

// Post routes


app.post("/Calculator", express.json(), function(req, res){
    try {
        let admin = req.session.admin ?? false;
        console.log(req.body)
    
        let subtaskquote = calculateBudget(req.body as subtaskForm)
        console.log(subtaskquote)
        res.json({
            subtaskquote
        });
    } catch (error) {
        console.error(error)
    }
})

app.post("/Login", express.urlencoded({extended:true}), async function(req, res){
    let uname = req.body.username;
    let pword = req.body.password;

    const user = await User.findOne({username: uname})
    if (!user) {
        res.status(401).send('User not found')
        return;
    }
    if (!user.authenticate(req.body.password)) {
        return res.status(401).send({
          error: "Username and Password don't match."
        })
    }

    req.session.loggedin = true;
    req.session.currentuser = uname;
    req.session.admin = user.admin;
    res.redirect('/');
});

app.post("/AddUser", express.urlencoded({extended:true}), async function(req, res){
    let data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        quotes: []
    };
    await new User(data).save();
    console.log("User created");
    res.redirect('/Account');
});

app.post("/AddToQuotes", express.json(), async function(req, res){
    try {
        if (!req.session.loggedin) { return; }
        console.log(req.body)
        let uname = req.session.currentuser;
        const user = await User.findOne({"username": uname})
        if (!user) {
            res.status(401).send('User not found')
            return;
        }
        let totalEstimate = 0;
        for (let subtask of req.body.subtasks) {
            console.log(subtask.paygrade)
            let estimate = calculateBudget(subtask);
            subtask.subquote = estimate;
            totalEstimate += estimate;
        }
        let quoteBody = {
            quote: totalEstimate,
            name: req.body.name,
            subtasks: req.body.subtasks
        }

        

        let newQuote = new Quote(quoteBody)
        await newQuote.save();
        //let id = new Schema.Types.ObjectId(newQuote._id.toString());
        let id = newQuote._id;

        if (user.quotes) {
            user.quotes.push(id);
            await user.save();
            console.log("Quote added to user");
            res.status(200).send('Quote added to user');
        } else {
            res.status(500).send('Failed to add quote to user');
        }
    } catch (error) {
        res.status(500).send('Failed to add quote to user');
        console.error(error)
    }
});

app.post("/UpdateQuote", express.json(), async function(req, res){
    try {
        if (!req.session.loggedin) { return; }
        console.log(req.body.subtasks)
        let totalEstimate = 0;
        for (let subtask of req.body.subtasks) {
            console.log(subtask.paygrade)
            let estimate = calculateBudget(subtask);
            subtask.subquote = estimate;
            totalEstimate += estimate;
        }
        let quoteBody = {
            quote: totalEstimate,
            name: req.body.name,
            subtasks: req.body.subtasks
        }     

        await Quote.findByIdAndUpdate(req.body.id, quoteBody)

        res.status(200).send('Updated Quote');

    } catch (error) {
        res.status(500).send('Failed to add quote to user');
        console.error(error)
    }
});

async function createRateDatabase() {
    let rates = [{
        paygrade: "standard",
        rate: 20
    },
    {
        paygrade: "senior",
        rate: 30
    }, {
        paygrade: "junior",
        rate: 10
    }]
    const rate = new HourlyRate(rates);

    try {
        const checkIfExists = (await HourlyRate.find({ paygrade: {$exists: true} })).length;
        if(checkIfExists === 0) {
            await rate.save();
            console.log("Created rate database");
        }
    } catch (error) {
        console.error(error)
    }

}

mongoose.set('strictQuery', false);
mongoose.connect(process.env.mongourl || "").then(() => {
    //createRateDatabase();
    console.log("Mongo Connected")
    app.listen(8080);
})
