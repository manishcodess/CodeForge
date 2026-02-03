const express = require('express')
const app = express()
require('dotenv').config();
const main =require('./config/db')
const cookie =require('cookie-parser')

app.use(express.json());
app.use(cookie.parser());

main()
.then( async()=>{
    app.listen(process.env.PORT,()=>{
    console.log("server listening at "+ process.env.PORT);

})

})
.catch(err => console.log("error aa gaya"+err))