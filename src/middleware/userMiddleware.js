const jwt = require("jsonwebtoken");
const userMiddleware = async (req,res)=>{
    try{
        const {token}= req.cokkies;
        if(!token){ throw new Error("token dont exist");}
            const payload = jwt.verify(token,proces.env.JWT_KEY);
            const {_id}=payload;
            if(!_id){ throw new Error(" dear user invalid token")}
 
            const result =await User.findbyId(_id);
            if(!result){
                throw new Error("user dont exist");
            }
            //redis k blocklsit me present toh h nahi
            const IsBlocked= await redisClient.exists(`token:${token}`)  ;
            if(IsBlocked){throw new Error("invlaid token")}
            req.results=result;
            next();    
        }
    catch(err){ res.send("erro is "+ err.message)}
}

module.exports = userMiddleware