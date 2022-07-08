//jshint esversion:6
//  All Packages are called to use.....

require('dotenv').config()            //Environment Variable Secure by use of dotenv 

const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const _=require("lodash");
const md5=require("md5");

// const encrypt=require("mongoose-encryption");

const app=express();          // Initializing app to express....

//console.log(process.env.API_KEY);

app.set('view engine','ejs'); //Views contain all html files  

app.use(bodyParser.urlencoded({extended:true}));    // bodyParser use for post body
app.use(express.static("public"));                  // public contain CSS files

/* ************************* MongoDB Cloud Connection Setup  ***************/

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});             //MongoDB Local Connection

const userSchema=new mongoose.Schema({
    userId:String,
    password:String
});

//Encryption For DB
//Store Secret variables in environmeent file  -----------------> Must followed practice by Developer
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"] });


const User=mongoose.model("User",userSchema);

app.get("/",function(req,res){
    res.render("home",{Msg:""});
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/login",function(req,res){
    res.render("login",{Msg:""});
});

app.get("/logout",function(req,res){
    res.render("home",{Msg:""});
});


app.post("/register",function(req,res){
   // console.log(req.body.username);
    
    User.findOne({userId:req.body.username},function(err,foundUser){
        if(!err){
            if(foundUser){
                res.render("register",{Msg:"User Already Exists"});
            }
            else{
                const user=new User({
                    userId:req.body.username,
                    password:md5(req.body.password)               //Password is change to hash code using md5
                });
                user.save();
                res.render("home",{Msg:"User Register Successfully"});
            }
        }
    });
    
});

app.post("/login",function(req,res){
    User.findOne({userId:req.body.username},function(err,foundUser){
        if(!err){
            if(foundUser){
                if(foundUser.password===md5(req.body.password)){               //hash code must be same to authenticate 
                    res.render("secrets");
                }
                else{
                    res.render("login",{Msg:"Incorrect Password.Please Try with valid Password"});
                }
            }
            else{
                res.render("login",{Msg:"User Credentials are not Valid.Please try with Valid Credentials"});
            }
        }
    });
});



app.listen(3000,function(){
    console.log("Server started on port 3000");
});




