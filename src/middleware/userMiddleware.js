const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient =require("../config/redis");

const userMiddleware = async (req,res,next)=>{
    try{
        const {token}= req.cookies;
        if(!token){ throw new Error("token dont exist");}
            const payload = jwt.verify(token,process.env.JWT_KEY);
            const {_id}=payload;
            if(!_id){ throw new Error(" dear user invalid token")}
 
            const result =await User.findById(_id);
            if(!result){
                throw new Error("user dont exist");
            }
            //redis k blocklsit me present toh h nahi
            const IsBlocked= await redisClient.exists(`token:${token}`)  ;
            if(IsBlocked){throw new Error("invalid token")}
            req.results=result;
            next(); 
        }
    catch(err){ res.send("Usermiddleware error: "+ err.message)}
    
}
 
module.exports = userMiddleware;