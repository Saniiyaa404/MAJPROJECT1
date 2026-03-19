const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const passportlocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type: String,
        required: true
    },
      
});

userSchema.plugin(passportLocalMongoose);//creates different options like authenticate
//passportLocalMongoose used as plugin bcoz it automatically implements username, hashing, salting, password

module.exports = mongoose.model("User", userSchema);