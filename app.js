//jshint esversion:6
//  All Packages are called to use.....

const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const _=require("lodash");
const encrypt=require("mongoose-encryption");
const app=express();          // Initializing app to express....

app.set('view engine','ejs'); //Views contain all html files  

app.use(bodyParser.urlencoded({extended:true}));    // bodyParser use for post body
app.use(express.static("public"));                  // public contain CSS files

/* ************************* MongoDB Cloud Connection Setup  ***************/

//mongoose.connect("mongodb+srv://Admin_Tango:test123@cluster0.ondmy.mongodb.net/wikiDB",{useNewURLParser:true});
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});             //MongoDB Local Connection

const userSchema=new mongoose.Schema({
    userId:String,
    password:String
});

//Encryption For DB

const secret="littleSecret.";
userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"] });


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


// app.get("/secrets",function(req,res){
//     res.render("secrets");
// });

app.post("/register",function(req,res){
    console.log(req.body.username);
    
    User.findOne({userId:req.body.username},function(err,foundUser){
        if(!err){
            if(foundUser){
                res.render("register",{Msg:"User Already Exists"});
            }
            else{
                const user=new User({
                    userId:req.body.username,
                    password:req.body.password
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
                if(foundUser.password===req.body.password){
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



//*******************************Commented Code****************************//
/*

// let port=process.env.PORT;

// if(port==null || port==""){
//     port=3000;
// }
// app.listen(port);


const article1=new Article({                          // new Item1
    title:"Web Dev",
    content:"Angular/React Js and Java are requried"
});

const article2=new Article({                          // new Item2
    title:"APP Dev",
    content:"React Native,Andriod Studios are requried"
});

const defaultArray=[article1,article2];           // Array of items

const listSchema=new mongoose.Schema({
    name:String,
    articles:[articleSchema]
});

const List=mongoose.model("Articles",listSchema);

******************************************************************************************

// const articleSchema=new mongoose.Schema({       // Defining Schema of Table
//     title:String,
//     content:String
// });

// const Article=mongoose.model("Article",articleSchema);  // Using Schema as model

// /* ************************************Articles of WIKI CRUD Operations using app.route ***********************************************************/

// app.route("/articles")
// .get(function(req,res){                             // Get Data from DB
//     Article.find({},function(err,foundArticles){
//      if(!err){
//          res.send(foundArticles);
//      }
//      else{
//          res.send(err);
//      }
//     });
//  })

//  .post(function(req,res){                           // ADD Data to DB via POST Request
//     const title=req.body.title;
//     const content=req.body.content;
    
//     const article=new Article({                                    //Making obj of collection
//         title:title,
//         content:content
//     });

//     Article.findOne({title:title},function(err,foundItem){
//         if(!err){
//             if(foundItem){
//                 res.send("Data already exits in DataBase.Please add new Data...");
//             }
//             else{
//                 article.save(function(err,response){
//                     if(!err){
//                         res.send("Data added Successfully.... ");
//                     }
//                     else{
//                         res.send(err);
//                     }
//                 });
//             }
//         }
//     });
// })

// .delete(function(req,res){

//     Article.deleteMany({title:req.body.title},function(err,response){
//         if(!err){
//             res.send("Data is deleted Succesfully");
//         }
//         else{
//             res.send(err);
//         }
//     });
// });

// /* **********************Specific Articles of WIKI CRUD Operations using app.route("/articles/:params") ***********************************************************/

// app.route("/articles/:articleTitle")                           //Specific get Item using ":params"
// .get(function(req,res){
//     Article.findOne({title:req.params.articleTitle},function(err,foundItem){
//         if(!err){
//             if(foundItem){
//                 res.send(foundItem);
//             }
//            else{
//             res.send("No Article found...");
//            }
//         }
//         else{
//             res.send(err);
//         }
//     });
// })

// .put(function(req,res){                                          //Update whole records
//     Article.findOneAndUpdate({title:req.params.articleTitle},
//         {title:req.body.title,
//          content:req.body.content},
//         {overwrite:true},
//         function(err,results){
//         if(!err){
//             res.send("Updated Successfully....");
//         }
//         else{
//             res.send("err");
//         }
//     });
// })

// .patch(function(req,res){                                          //update specific records 
//     Article.updateOne({title:req.params.articleTitle},
//         {$set:req.body},
//         function(err,results){
//         if(!err){
//             res.send("Specific Record Updated ....");
//         }
//         else{
//             res.send(err);
//         }
//     });
// })

// .delete(function(req,res){
//     Article.deleteOne({title:req.params.articleTitle},function(err,results){
//         if(!err){
//             res.send("Article deleted successfuly");
//         }
//         else{
//             res.send(err);
//         }
//     });
// });

