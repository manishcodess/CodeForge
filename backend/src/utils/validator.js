const validator = require("validator");

const validate = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid request data");
    }

    const { firstName, emailId, password } = data;

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 3) {
        throw new Error("First name must be at least 3 characters");
    }

    if (!emailId || typeof emailId !== 'string' || !validator.isEmail(emailId)) {
        throw new Error("Invalid Email");
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }
};

module.exports = validate;
