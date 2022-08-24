require("dotenv").config()
const mongoose = require("mongoose")
const File = require("./models/File")
const bcrypt = require("bcrypt");
const User = require("./models/User")
mongoose.connect(process.env.DATABASE_URL, () => {
    console.log("connected to db succesffuly")
})

run()
async function run(){
    try{
        //empty two table
        await File.deleteMany({}).then(function () {
            console.log("all files deleted"); // Success
        }).catch(function (error) {
            console.log(error); // Failure
        });
        await User.deleteMany({}).then(function () {
            console.log("all users deleted"); // Success
        }).catch(function (error) {
            console.log(error); // Failure
        });
        //add admin account
        //enter the initialized password whatever what here
        const hash = bcrypt.hashSync("DT_project2022", 10);
        const admin = await User.create({
            name: "admin",
            password: hash,
            type:"admin",
            avatar:"Panda",
        })
        console.log(admin,"admin created")
        await admin.save()
    }catch(e){
        console.log(e)
    }
    


}
