const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");
const app = express();


// Use the 'public' folder to serve static files
app.use(express.static("public"));
// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}
// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { name, avatar,  password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));


    //
    // E. Checking for the user data correctness
    // name, avatar, name and password are not empty
    if (!name || !avatar ||  !password) {
        res.json({ status: "error", error: "name, avatar, name or password is empty" });
    }
    // The name contains only underscores, letters or numbers. You will find the given function containWordCharsOnly() useful here
    else if (!containWordCharsOnly(name)) {
        res.json({ status: "error", error: "name can contains word chars only" });
    }
    // The name does not exist in the current list of users. You can do this using the in operator on the users' object that you have read in the previous step
    else if (name in users) {
        res.json({ status: "error", error: "name already exists." });
    } else {

        //
        // G. Adding the new user account
        //
        const hash = bcrypt.hashSync(password, 10);
        users[name] = { avatar: avatar,  password: hash };

        //
        // H. Saving the users.json file
        //
        fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

        //
        // I. Sending a success response to the browser
        //
        res.json({ status: "success" });
    }
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    //
    // E. Checking for name/password
    //
    const user = users[name];
    if (user == null) {
        res.json({ status: "error", error: "name or Password is not correct" });
    };
    const hashedPassword = user['password']; /* a hashed password stored in users.json */
    if (!bcrypt.compareSync(password, hashedPassword)) {
        /* Passwords are not the same */
        res.json({ status: "error", error: "name or Password is not correct" });
    };


    //
    // G. Sending a success response with the user account
    //
    const avatar = user['avatar'];
    req.session.user = { name, avatar,  };
    res.json({ status: "success", user: { name, avatar } });

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    if (req.session.user) {
        const user = req.session.user;
        const avatar = user['avatar'];
        const name = user['name'];
        res.json({ status: "success", user: { user, avatar, name } })
    } else {
        res.json({ status: "error", error: "No session is established." })
    }

    //
    // D. Sending a success response with the user account
    //


    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;

    //
    // Sending a success response
    //
    res.json({ status: "success" })

    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

app.listen(443)