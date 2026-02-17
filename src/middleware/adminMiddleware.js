const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient =require("../config/redis");

const adminMiddleware = async (req,res,next)=>{
    try{
        const {token}= req.cookies;
        if(!token){ throw new Error("token dont exist");}
            const payload = jwt.verify(token,process.env.JWT_KEY);
            const {_id}=payload;
            if(!_id){ throw new Error(" dear user invalid token")}
 
            const result =await User.findById(_id);
            if(payload.role!='admin'){
                return res.status(403).send("admin only");
            }
            if(!result){
                throw new Error("user dont exist");
            }
            //redis k blocklsit me present toh h nahi
            const IsBlocked= await redisClient.exists(`token:${token}`)  ;
            if(IsBlocked){throw new Error("invalid token")}
            req.results=result;
            req.result=result;
            next(); 
        }
    catch(err){ 
        return res.status(401).send("adminmiddleware error: " + err.message);
    }
    
}

module.exports = adminMiddleware