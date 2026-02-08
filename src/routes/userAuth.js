const express= require('express');
const authRouter = express.Router();
const {register,login,logout}=require("../controllers/userAuthent")
const userMiddleware =require("../middleware/userMiddleware");
//register
authRouter.post('/register',register);
authRouter.post('/login',login); //middleware ensures token takatak h valid hai
authRouter.post('/logout',userMiddleware,logout);

module.exports =authRouter;


