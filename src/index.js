const express = require('express')
const app = express()
require('dotenv').config();
const main =require('./config/db')
const cookie =require('cookie-parser')
const authRouter =require("./routes/userAuth")
const redisClient=require("./config/redis")

app.use(express.json());
app.use(cookie());

app.use('/user',authRouter);

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
    console.error("error is:", err.message);
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