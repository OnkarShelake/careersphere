import User from '../models/User.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export const registerUser = async (req, res) => {
    try {
        const { name , email, password} = req.body;
        
        
        if(!name || !email || !password) return res.status(400).json({message:"Missing required fields"});
        
        //check if user already exists
        const existUser = await User.findOne({email});
        
        if(existUser) return res.status(400).json({message:"User already exists with this email"});
        
        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        })
        
        const userId = newUser._id;
        //assign a token to the user

        const token = jwt.sign({id:newUser._id, role:newUser.role}, process.env.JWT_SECRET, {expiresIn:'7d'});

        return res.status(201).json({token , user:{id:userId,name:newUser.name, email:newUser.email, role:newUser.role}});
        
        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}


export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        

        if(!user) return res.status(400).json({message:"Invalid credentials"});

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

        const token = jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET, {expiresIn:'7d'});

        return res.status(200).json({message:"Login successful", token, user:{id:user._id, name:user.name, email:user.email, role:user.role}});


        
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}