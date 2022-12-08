const express = require("express");
const app = express();
const path = require("path");
const final = require("./final.js");
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/finalViews/home.html"));
});

app.get("/register", (req,res) => {
    res.sendFile(path.join(__dirname + "/finalViews/register.html"));
});

app.get("/signIn", (req,res) => {
    res.sendFile(path.join(__dirname + "/finalViews/signIn.html"));
});

app.post("/register", (req,res) => {
    final.register(req.body)
    .then(() => {
        let resText = `<p>${user.email} registered successfully.
        <a href = "/finalViews/register.html"> Go Home <a>`
        res.send(resText);
    }) 
    .catch (err => res.send("Error: cannot create the user."))
});

app.post("/login", (req,res) => {
    req.body.userAgent = req.get('User-Agent');
    final.checkUser(req.body).then((user) => {
        req.session.user = {
            userName:user.userName,
            email:user.email,
            loginHistory:user.loginHistory
        }
        res.redirect('/employees');
    })
    .catch(err => {
        res.send("Error: email or password cannot be empty.")
    }) 
});

app.use((req, res) => {
    res.status(404).send("Error 404: Page Not Found.");
});

final.startDB()
.then(() => {
    app.listen(HTTP_PORT, onHttpStart);
}).catch((err) => {
    console.log("Error: " + err);
});