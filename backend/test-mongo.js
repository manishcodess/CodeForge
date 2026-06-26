require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_CONNECT_STRING).then(() => {
    console.log("MongoDB Connected with Custom DNS!");
    process.exit(0);
}).catch(err => {
    console.log("MongoDB Failed!", err.message);
    process.exit(1);
});
