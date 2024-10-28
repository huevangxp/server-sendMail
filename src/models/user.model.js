//create user model here
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    email: {
        type: String,
        unique: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    phone: String,
    password: String
});
module.exports = mongoose.model('User', userSchema)