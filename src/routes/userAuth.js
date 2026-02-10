const express= require('express');
const authRouter = express.Router();
const {register,login,logout,adminRegister}=require("../controllers/userAuthent")
const userMiddleware =require("../middleware/userMiddleware");
const adminMiddleware =require('../middleware/adminMiddleware')

//register
authRouter.post('/register',register);
authRouter.post('/login',login); //middleware ensures token takatak h valid hai
authRouter.post('/logout',userMiddleware,logout);
authRouter.post('/admin/register',adminMiddleware,adminRegister);

module.exports =authRouter;


