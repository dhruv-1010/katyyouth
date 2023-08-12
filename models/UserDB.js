const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')


let userSchema = new mongoose.Schema({
    email:{
        type : String , 
        trim : true , 
        required : true
    }
})


userSchema.plugin(passportLocalMongoose);


let UserDB = mongoose.model('UserDB' , userSchema);

module.exports = UserDB;