const express= require("express")
const app = express()
const path= require("path")
const mongoose =require("mongoose");
const User =require("./model/user");
const blog= require("./model/blog");
const session = require('express-session')
const bcrypt = require('bcrypt');
const saltRounds = 10;
app.use(session({
    secret: 'keyboard cat',
    // resave: false,
    // saveUninitialized: true,
    // cookie: { secure: true }
  }))
app.use(express.static(path.join(__dirname,"static")))
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set('view engine', 'hbs');


function checkIsLoggedIn(req,res,next){
    if(req.session.isLoggedIn){
        next()
    }else{
        res.redirect("/login");
    }
}

function checkIsAdmin(req, res, next) {
    if (req.session.isAdmin && req.session.isLoggedIn) {
        next();
    } else if (req.session.isLoggedIn) {
        res.redirect("/");
    } else {
        res.redirect("/login");
    }
}


app.get("/",checkIsLoggedIn,(req,res)=>{
    res.render("home",{user:req.session.user});
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
    const {username,password}=req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({ username, password: hashedPassword });
    await  newUser.save();
    res.send("User registered successfully!!!")
})

app.get("/admin/dashboard", checkIsAdmin, async (req, res) => {
    let unapprovedBlogs = await blog.find({ approved: false }).populate("user");
    res.render("dashboard", { unapprovedBlogs });
});


app.post("/login",async(req,res)=>{
    const {username,password} =req.body;
    let user=await User.findOne({username:username});

    if(user){
        const passwordMatch = await bcrypt.compare(password, user.password);

        if(passwordMatch){
            if (user.isAdmin) {
                req.session.isAdmin = true;
            }
            req.session.isLoggedIn=true;
            req.session.user=user
            res.redirect("/");
        }else{
            res.send("Invalid password");
        }
    }else{
        res.send("user not found!!!");
    }
})

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.send("Error logging out");
        } else {
            res.redirect("/login");
        }
    });
});

app.post("/addblog",async(req,res)=>{
    const {title,content} =req.body;
    let newBlog= new blog({title,content,user:req.session.user._id});
    await newBlog.save();
    let user = await User.findOne({_id:req.session.user._id})
    user.blog.push(newBlog._id);
    await user.save();
    res.send("done");
    

})
app.get("/myblog",async(req,res)=>{
    let user=await User.findOne({_id:req.session.user._id}).populate("blog");
    console.log(user);
    res.render("myblog",{blogs:user.blog,user:user});
})

app.get("/blogs",async(req,res)=>{
    let blogs=await blog.find({approved: true}).populate("user");
    console.log(blogs)
    res.render("allblog",{blogs})
})

app.post("/admin/approve-blog", async (req, res) => {
    const blogId = req.body.blogId;
    await blog.updateOne({ _id: blogId }, { $set: { approved: true } });
    res.redirect("/admin/dashboard");
});

app.post("/admin/disapprove-blog", async (req, res) => {
    const blogId = req.body.blogId;
    await blog.deleteOne({ _id: blogId });
    res.redirect("/admin/dashboard");
});


mongoose.connect("mongodb://127.0.0.1:27017/blognew").then(()=>{
    app.listen(2345,()=>{
        console.log("server started at port 2345");
      })
})
