//jshint esversion:6
//  All Packages are called to use.....

require('dotenv').config()            //Environment Variable Secure by use of dotenv 

const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const _=require("lodash");
const md5=require("md5");
const bcrypt=require("bcrypt");
const saltRounds=10;
// const encrypt=require("mongoose-encryption");
const session=require("express-session");                             //Session package
const passport=require("passport");                                   //Passport package
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

const app=express();          // Initializing app to express....

//console.log(process.env.API_KEY);

app.set('view engine','ejs'); //Views contain all html files  

app.use(bodyParser.urlencoded({extended:true}));    // bodyParser use for post body
app.use(express.static("public"));                  // public contain CSS files

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());                    // passport initialze
app.use(passport.session());                       // session created
/* ************************* MongoDB Cloud Connection Setup  ***************/

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});             //MongoDB Local Connection
// mongoose.set("useCreateIndex",true);

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    googleId:String,
    secret:String
});

//Encryption For DB
//Store Secret variables in environmeent file  -----------------> Must followed practice by Developer
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"] });

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User=mongoose.model("User",userSchema);
                              
passport.use(User.createStrategy());                                //passport strategy started
                
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // This option tells the strategy to use the userinfo endpoint instead
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile); 
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//Get Methods

app.get("/",function(req,res){
    res.render("home",{Msg:""});
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect Secrets.
    res.redirect('/secrets');
  });

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/login",function(req,res){
    res.render("login",{Msg:""});
});

app.get("/secrets",function(req,res){                 //allowing to navigate to secrets page on authentication
   
   User.find({secret:{$ne:null}},function(err,foundUsers){
    if(req.isAuthenticated()){
        if(err){
            console.log(err);
        }else{
            if(foundUsers){
                res.render("secrets",{usersSecrets:foundUsers});
            }
        }
    }else{
        res.redirect("/");
    }
   
   });
   
    // if(req.isAuthenticated()){
    //     res.render("secrets",{Msg:""});
    // }
    // else{
    //     res.redirect("/");
    // }
    
});

app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }
    else{
        res.redirect("/");
    }
});

app.post("/submit",function(req,res){
    const submittedSecret=req.body.secret;
    console.log(submittedSecret);
    console.log(req.user.id);

    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                foundUser.secret=submittedSecret;
                foundUser.save();
                res.redirect("/secrets");
                console.log("reached");
            }
        }
    });
});

app.get("/logout",function(req,res){
     req.logout(function(err){                              //logout existing session 
        if(err){
            // console.log(err);                      
        }
     });
    res.redirect("/");
});

//Post Methods

app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){                //authenticating and creating session cookie
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login",function(req,res){
    
    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){             //checking session cokkie credentials matching or not with users
                res.redirect("/secrets");
            });
        }

    });
});

app.listen(3000,function(){
    console.log("Server started on port 3000");
});


/*******************************************  Commented Code  ***************************************************************** */
/*

//Register and Login Code using hashing and bcrypt...

app.post("/register",function(req,res){
    
    User.findOne({userId:req.body.username},function(err,foundUser){
        bcrypt.hash(req.body.password,saltRounds,function(err,hash){
            if(!err){
                if(foundUser){
                    res.render("register",{Msg:"User Already Exists"});
                }
                else{
                    const user=new User({
                        userId:req.body.username,
                        password:hash                                  //bcrypt is use with saltrounds hashing            //Password is change to hash code using md5 -----> md5(req.body.password)    
                    });
                    user.save();
                    res.render("home",{Msg:"User Register Successfully"});
                }
            }
        });
    });
    
});

app.post("/login",function(req,res){
    User.findOne({userId:req.body.username},function(err,foundUser){
       
            if(!err){
                if(foundUser){
                    bcrypt.compare(req.body.password,foundUser.password,function(err,results){
                    if(results===true){               //hash using bcrypt       //hash code must be same to authenticate 
                        res.render("secrets");
                    }
                    else{
                        res.render("login",{Msg:"Password is Invalid.Please use valid password"});
                    }
                });
            }
            else{
                res.render("login",{Msg:"User Credentials are not Valid.Please try with Valid Credentials"});
            }
        }
    });
});


*/
