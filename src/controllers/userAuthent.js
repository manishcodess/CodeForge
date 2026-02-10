const User = require("../models/user.js")
const validate= require('../utils/validator');
const bcrypt  = require('bcrypt');
const jwt = require('jsonwebtoken');
//as i see required:true for firstName,emailId,password
const register = async (req,res)=>{
    try{ 
        
        validate(req.body);//validated data successfully that its strong no  
        const {firstName,emailId,password} =req.body;  
        req.body.password = await bcrypt.hash(password,10);
        req.body.role = 'user'
        const user = await User.create(req.body);//user cant register twice due tot this
                       //jwt.sign(payload, secretKey, options)
        const token = jwt.sign({_id:user._id,emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn :60*60});
        //res.cookie sends the token to browser(client) as a cookie.
        //“res.cookie() is used by the server to store data in the user’s browser as a cookie.
        // In this case, it stores a JWT token for 1 hour so the browser can send it automatically with future requests.
        res.cookie('token',token,{maxAge:60*60*1000})
        //maxagein milisec so 1000 alternative isexpires: new Date(Date.now() + 60 * 60 * 1000)
        res.status(201).send("user register success") 

    }
    catch(err){
        res.status(400).send("error is "+err)

    }
}

const login =async (req,res)=>{
    try{
        const {emailId,password}=req.body;
        if(!emailId)
            throw new Error("invalid credentials");
        if(!password)
            throw new Eroor("invalid credentials");
        const user =await User.findOne({emailId});
        //password->plain password by user through req.body &&  user.passsword -> hashed psasword present in mongodb
        const match =bcrypt.compare(password,user.password );
        if(!match)
            throw new Error("invalid credentials")
        const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn :60*60});
        res.cookie('token',token,{maxAge:60*60*1000}); //hum dekh skate h cookie  ko in postman bcs of this for 1 hr
        res.status(200).send("user logged success"); //200 request succeeded (eg g et ,push)

    }
    catch(err){
        res.status(401).send("err hua "+err) //401 is unauthorized:authentication faile
    }
}

const logout= async (req,res)=>{
    try{
        //just invalidate cookie 1)redis || 2)change to null
        const {token} =req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`,'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp)

        res.cookie('token',null,{expires:new Date(Date.now())});
        res.status(200).send("user logged out successfully");
    }
    catch(err){
        res.status(503).send("error during logout: "+err);
    }
}

const adminRegister =async (req,res)=>{
    try{ 
         
        validate(req.body);//validated data successfully that its strong no  
        const {firstName,emailId,password} =req.body;  
        req.body.password = await bcrypt.hash(password,10);
        req.body.role = 'admin'
        const user = await User.create(req.body);//user cant register twice due tot this
                       //jwt.sign(payload, secretKey, options)
        const token = jwt.sign({_id:user._id,emailId:emailId,role:'admin'},process.env.JWT_KEY,{expiresIn :60*60});
        //res.cookie sends the token to browser(client) as a cookie.
        //“res.cookie() is used by the server to store data in the user’s browser as a cookie.
        // In this case, it stores a JWT token for 1 hour so the browser can send it automatically with future requests.
        res.cookie('token',token,{maxAge:60*60*1000})
        //maxagein milisec so 1000 alternative isexpires: new Date(Date.now() + 60 * 60 * 1000)
        res.status(201).send("user register success") 

    }
    catch(err){
        res.status(400).send("error is "+err)

    }
}

module.exports = {register,login,logout,adminRegister};