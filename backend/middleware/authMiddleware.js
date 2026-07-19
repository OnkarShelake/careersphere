import express from 'express'

import jwt from 'jsonwebtoken'


const authMiddleware = async (req, res,next)=>{
try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: "Authorization header not found" });
        }
        let token;
        if (req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(' ')[1];
            console.log("token from authmiddleware : ", token);
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                
                    req.user = decoded;
                    next();
            } catch (error) {
              return res.status(401).json({message:"invalid token or token expired"})
            }

        }
        else {
            return res.status(401).json({ message: "Invalid token format" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default authMiddleware;      