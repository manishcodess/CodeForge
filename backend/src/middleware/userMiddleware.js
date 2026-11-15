const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");

const userMiddleware = async (req, res, next) => {
    try {
        let token = req.cookies?.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).send("Error: Token is not present");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;

        if (!_id) {
            return res.status(401).send("Error: Invalid token");
        }

        if (redisClient.isOpen) {
            const isBlocked = await redisClient.exists(`token:${token}`);
            if (isBlocked) {
                return res.status(401).send("Error: Invalid Token");
            }
        }

        const result = await User.findById(_id);
        if (!result) {
            return res.status(401).send("Error: User Doesn't Exist");
        }

        req.result = result;
        req.token = token;
        next();
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};

module.exports = userMiddleware;

