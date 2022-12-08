const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "email": {
        "type":String,
        "unique":true
    },
    "password":String,
});

let finalUsers;
exports.startDB = () => {
    return new Promise((resolve,reject) => {
        let db = mongoose.createConnection("mongodb+srv://Trump007:Wang930811@senecaweb.6rnztgg.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err) => {
            console.log('Cannot connect to DB.');
            reject();
        })
        db.once('open', () => {
            finalUsers = db.model("Users",userSchema);
            console.log('DB connection successful.');
            resolve();
        })
    })
};

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}

exports.register = (user) => {
    return new Promise((resolve, reject) => {
        if (isEmptyOrSpaces(user.password)||isEmptyOrSpaces(user.password)){
            reject("Error: email or password cannot be empty.");
        }
        else {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        user.password = hash;
                        let newUser = new finalUsers(user);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject('Error: '+ user.email + 'already exists');
                                }
                                else {
                                    reject("Error: cannot create the user.");
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

exports.signIn = (user) => {
    return new Promise((resolve, reject) => {
        finalUsers.find({email: user.email})
        .exec()
        .then(users => {
            if(!users){
                reject('Cannot find the user: ' + user.email);
            }
            else{
                bcrypt.compare(user.password, users[0].password).then(res => {
                    if(!res){
                        reject("Incorrect Password for user: " + user.email); 
                    }
                    else {  
                        resolve(users[0]) 
                    }
                })
            }
        })
    })
};