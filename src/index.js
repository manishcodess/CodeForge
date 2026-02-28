const express = require('express')
const app = express()
require('dotenv').config();
const main =require('./config/db')
const cookieParser =require('cookie-parser')
const authRouter =require("./routes/userAuth")
const redisClient=require("./config/redis")
const problemRouter =require("./routes/problemCreator");
const submitRouter =require("./routes/submit")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter)

const InitializeConnection = async () => {
  try {
    await Promise.all([
      main(),
      redisClient.connect()
    ]);

    console.log("db connected");

    app.listen(process.env.PORT, () => {
      console.log("server is running at " + process.env.PORT);
    });

  } catch (err) {
    console.error("initializeconnection error is:", err.message);
  } 
}; 

InitializeConnection();


// main()
// .then( async()=>{
//     app.listen(process.env.PORT,()=>{
//     console.log("server listening at "+ process.env.PORT);

// })

// })
// .catch(err => console.log("error aa gaya"+err)) 