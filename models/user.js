var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    _id: String, //Instead of default _id , email is considered as id to retrieve user profile info with email id.
    name: String,
    group: String, 
    token: String,
    tokenValidity : Boolean // This is basically TRUE during initial login ,upon logout , it would be FALSE to invalidate accesstoken - 21Oct2016.
}, { _id: false });

module.exports = mongoose.model("User", userSchema);