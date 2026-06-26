const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'trucks-beginner-skilled-34747.db.redis.io',
        port: 10929
    }
});
 
module.exports = redisClient;