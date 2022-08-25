require("dotenv").config()
const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
//const session = require('cookie-session');
const app = express();
const multer = require("multer")
const mongoose = require("mongoose")
//put files in folder named 'uploads'
const upload = multer({ dest: "uploads",})
const File = require("./models/File")
const User = require("./models/User")
const MongoStore = require("connect-mongo");
mongoose.connect(process.env.DATABASE_URL, ()=>{
    console.log("connected to db succesffuly")
})
app.set("view engine", "ejs")

//midware
// Use the 'public' folder to serve static files
app.use(express.static("public"));
// Use the json middleware to parse JSON data
app.use(express.json());
app.use(express.urlencoded({extended:true}))


// Use the session middleware to maintain sessions
const chatSession = session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: { maxAge: 3600000 },
    //set one hour cookie
    store: MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: process.env.MONGO_DB_NAME,
        collectionName: "sessions",
        stringify: false,
        autoRemove: "interval",
        autoRemoveInterval: 1
    })
});
app.use(chatSession);


app.get("/",(req, res)=>{
    res.render("index")
})
// Handle the /register endpoint
app.post("/register", async (req, res) => {
    // Get the JSON data from the body
    const { name, avatar,  password } = req.body;

    // name, avatar, name and password are not empty
    if (!name || !avatar ||  !password) {
        res.json({ status: "error", message: "name, avatar, name or password is empty" });
    }
    // The name contains only underscores, letters or numbers. You will find the given function containWordCharsOnly() useful here
    else if (!containWordCharsOnly(name)) {
        res.json({ status: "error", message: "name can contains word chars only" });
    }
    // The name does not exist in the current list of users. You can do this using the in operator on the users' object that you have read in the previous step
    else {
        const user = await User.findOne({ name: name });
        if (user!==null) {
            res.json({ status: "error", message: "Name already exists." });
        } else {
            //Adding the new user account
            const hash = bcrypt.hashSync(password, 10);
            const customer = await User.create({
                name: name,
                password: hash,
                type: "customer",
                avatar: avatar,
            })
            //console.log(customer, "customer created")
            await customer.save()
            // I. Sending a success response to the browser
            res.json({ status: "success" });
        }
    }
       
});

// Handle the /signin endpoint
app.post("/signin", async (req, res) => {
    // Get the JSON data from the body
    const { name, password } = req.body;
    const user = await User.findOne({name:name});

    if (user != null){
        const hashedPassword = user['password'];
        /* a hashed password stored in users.json */
        if (!bcrypt.compareSync(password, hashedPassword)) {
            /* Passwords are not the same */
            res.json({ status: "error", message: "Name or Password is not correct" });
            return
        } else {
            // Sending a success response with the user account
            const avatar = user['avatar'];
            req.session.user = { name, avatar, };
            res.json({ status: "success", user: { name, avatar } });
            return
        }
    }else{
        //console.log("no such name found, cannot login")
        res.json({ status: "error", message: "Name or Password is not correct" });
        return;
        
    }
    


    
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {
    // B. Getting req.session.user
    if (req.session.user) {
        const user = req.session.user;
        const avatar = user['avatar'];
        const name = user['name'];
        res.json({ status: "success", user: { user, avatar, name } })
        return
    } else {
        res.json({ status: "error", message: "No session is established." })
        return
    }

});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    // Deleting req.session.user
    delete req.session.user;
    req.session.destroy();
    res.json({ status: "success", message:"log out sucessfully" })
});

//upload files from clients to server
app.post("/upload", upload.single("file"),async (req, res)=>{
    const  uploadFile = req.file;
    const filePassword = req.body.password;
    const uploader = req.body.uploader;

    if (!uploadFile) {
        res.json({ status: "error", message:"Null file detected" } );
    }else{
        const fileData = {
            path: uploadFile.path,
            originalName: uploadFile.originalname,
        }
        
        if (filePassword != null && filePassword !== "") {
            fileData.password = await bcrypt.hash(filePassword, 10)
        }
        if (uploader != null && uploader !== "") {
            fileData.uploader = uploader
        }

        const file = await File.create(fileData)
        //console.log(file, req.body)

        res.json({ 
            status: "success", 
            message: "uploaded success", 
            filename:file.originalName 
        })
    }
    
})

//deliver the file list, show as table
app.get("/showfiles",(req, res)=>{
    File.find({},(error, files)=>{
        var fileInfo={};
        files.forEach(file => {
            fileInfo[file._id] = {
                originalName: file.originalName,
                downloadCount: file.downloadCount,
                uploadTime: file.uploadTime,
                uploader:file.uploader
            };
        });
        res.json({
            status: "success",
            success: "uploaded success",
            fileList: fileInfo
        })
    })
})

//fetch file with file id, also check the password if needed
app.route("/file/:id").get(handleDownload).post(handleDownload)

app.post("/deletefile", async (req, res) => {
    //admin can delete all; other customer can only delete those whose uploader are themselves
    const{id, name}= req.body;
    let temp = await File.findById(id);
    if(temp.path){
        let path = temp.path;
        let deleteInfo;
        if(name==="admin"){
            deleteInfo = await File.deleteOne({ _id: id})
        }
        else{
            deleteInfo = await File.deleteOne({ _id: id, uploader: name })
        }
        if (deleteInfo.deletedCount == 1) {
            try {
                fs.unlinkSync(path)
                res.json({
                    status: "success",
                    message: "Delete successfully",
                })
            } catch (err) {
                res.json({
                    status: "error",
                    message: "Delete name from db, but failed physically",
                })
            }

        } else {
            res.json({
                status: "error",
                message: "Permission Deny",
            })
        }
    }else{
        res.json({
            status: "error",
            message: "File not exist",
        })
    }
    
})
// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

async function handleDownload(req, res){
    const file = await File.findById(req.params.id);
    if(file==null){
        res.render("password",
            {
                error: true,
                filename: file.originalName,
                message: "Already been removed, please refresh."
            }
        )
        return
    }
    if (file.password != null) {
        //console.log(req.body)
        if (req.body.password == null) {
            res.render("password", 
                    { 
                        error: true, 
                        filename: file.originalName,
                        message:"Please Enter Password." 
                    }
                )
            return
        }
        if (!await bcrypt.compare(req.body.password, file.password)) {
            res.render("password", 
            { 
                filename: file.originalName, 
                error: true,
                message:"Invalid Password" }
                )
            return
        }
    }
    file.downloadCount++;
    await file.save();
    res.download(file.path, file.originalName)
}
const PORT = process.env.PORT||3000;
app.listen(PORT)