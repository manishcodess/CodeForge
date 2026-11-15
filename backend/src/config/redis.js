const { createClient } = require('redis');

const host = process.env.REDIS_HOST || 'redis-12599.c8.us-east-1-4.ec2.cloud.redislabs.com';
const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 12599;
const password = process.env.REDIS_PASS;

const redisClient = process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : createClient({
        username: process.env.REDIS_USER || 'default',
        password: password,
        socket: {
            host: host,
            port: port
        }
    });

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

module.exports = redisClient;
