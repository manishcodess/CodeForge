const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require("./routes/authRoutes");
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemRoutes");
const submitRouter = require("./routes/submissionRoutes");
const aiRouter = require("./routes/aiRoutes");
const videoRouter = require("./routes/videoRoutes");
const cors = require('cors')

// Trigger nodemon restart
// console.log("Hello")

app.use(cors({
    origin: [
        process.env.FRONTEND_URL, 
        'http://localhost:5173', 
        'https://code-forge-brown.vercel.app'
    ].filter(Boolean),
    credentials: true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use("/video",videoRouter);


const InitalizeConnection = async () => {
    try {
        await main();
        console.log("MongoDB Connected");

        try {
            await redisClient.connect();
            console.log("Redis Connected");
        } catch (redisErr) {
            console.warn("Redis connection failed (proceeding without Redis cache):", redisErr.message);
        }
        
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log("Server listening at port number: " + PORT);
        });

    } catch (err) {
        console.error("Fatal Server Startup Error:", err);
        process.exit(1);
    }
};


InitalizeConnection();

