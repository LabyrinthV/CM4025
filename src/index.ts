import "dotenv/config"
import express from "express"
import express_session from "express-session"
import path from "node:path"
import mongoose, { Schema } from 'mongoose';
import User from "./classes/User";
import Quote from "./classes/Quote";
import { calculateBudget } from "./classes/calculator";
import { subtaskForm } from "./types/subtask";

declare module "express-session" {
    interface SessionData {
        user: string;
        currentuser: string;
        loggedin: boolean;
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
    res.render('pages/Calculator', {loggedin});
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

        }    
    } catch (error) {
        res.status(500).send('Could not delete quote');
    }
});

// Post routes

function parseNumberArray(incomingData: string | string[], targetArray: number[]) {
    if (Array.isArray(incomingData)) {
        for (let item of incomingData) {
            targetArray.push(parseInt(item))
        }
    } else {
        targetArray.push(parseInt(incomingData))
    }
}




app.post("/Calculator", express.urlencoded({extended:true}), function(req, res){
    try {
        console.log(req.body)

        const formData:subtaskForm = {
            ongoingCosts: {
                ongoingCostsAmount: parseInt(req.body.ongoingCostsAmount),
                frequency: req.body.frequency,
            },
            oneOffCosts: parseInt(req.body.oneOffCost),
            time: parseInt(req.body.time),
            period: req.body.period,
            payGrade: req.body.payGrade,
            payGradeAmount: parseInt(req.body.payGradeAmount)
        }
    
        // parseNumberArray(req.body.time, formData.time)
        // parseNumberArray(req.body.payGradeAmount, formData.payGradeAmount)
    
        // if(typeof req.body.payGrade === "string") {
        //     formData.payGrade.push(req.body.payGrade)
        // } else {
        //     formData.payGrade = req.body.payGrade
        // }
        // if (typeof req.body.period === "string") {
        //     formData.period.push(req.body.period)
        // } else {
        //     formData.period = req.body.period
        // }
    
    
        let finalBudget = calculateBudget(formData)
    
        res.json({
            finalBudget
        });
        console.log(formData)
        res.json({})
    } catch (error) {
        
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
            let estimate = 0;
            // let estimate = calculateBudget(subtask);
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
    }
});


mongoose.set('strictQuery', false);
mongoose.connect(process.env.mongourl || "").then(() => {
    console.log("Mongo Connected")
    app.listen(8080);
})
