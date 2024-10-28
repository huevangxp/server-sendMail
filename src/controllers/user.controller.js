// CRUD user here
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

exports.register = async (req, res) => {
    try{

        const { username, email, gender, phone, password } = req.body;
        // check if user data null return  
        if(!username || !email || !gender || !phone || !password){
            return res.status(400).json({msg: 'Please fill in all fields'});
        }

        // check if user already exist
        const userOld = await User.findOne({email});
        if(userOld){
            return res.status(400).json({msg: 'User already exist'});
        }

        //check phone
        const phoneOld = await User.findOne({phone});
        if(phoneOld){
            return res.status(400).json({msg: 'Phone already exist'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({
            username ,
            email ,
            gender ,
            phone ,
            password : hashedPassword
        })
        const newUser = await user.save();
      return  res.status(200).json({massage: 'User created successfully', user: newUser.username});
    }catch(error){
       return res.status(500).json(error);
    }
}

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;
        // check if user data null return  
        if(!email || !password){
            return res.status(400).json({msg: 'Please fill in all fields'});
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg: 'User does not exist'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({msg: 'Incorrect password'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
      return  res.status(200).json({token, user: user.username});
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.delete = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            return res.status(400).json({msg: 'User does not exist'});
        }
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({msg: 'User does not exist'});
        }
        await User.findByIdAndDelete(id);
        return res.status(200).json({msg: 'User deleted successfully'});
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.selectAllUser = async (req, res) => {
    try{
        const users = await User.find();
        if(!users){
            return res.status(400).json({msg: 'User does not exist'});
        }
        return res.status(200).json(users);
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.getOneUser = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            return res.status(400).json({msg: 'User does not exist'});
        }
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({msg: 'User does not exist'});
        }
        return res.status(200).json(user);
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.updateUser = async (req, res) => {
    try{
        const { id } = req.params;
        if(!id){
            return res.status(400).json({msg: 'User does not exist'});
        }
        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({msg: 'User does not exist'});
        }
        const { username, email, gender, phone, password } = req.body;
        await User.findByIdAndUpdate(id, {username, email, gender, phone, password});
        return res.status(200).json({msg: 'User updated successfully'});
    }catch(error){
        return res.status(500).json(error);
    }
}

exports.sendOTPbyEmail = async (req, res) => {
    try{
        // add function send otp to email here by nodemailer
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });
        let otp = Math.floor(Math.random()*1000000);
        let mailOptions = {
            from: process.env.EMAIL,
            to: req.body.email,
            subject: 'Verify your email',
            text: `Your OTP is ${otp}`
        };
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log('Email sent: ' + info.response);
            }
        });
        return res.status(200).json({otp});

    }catch(error){
        return res.status(500).json(error);
    }
}