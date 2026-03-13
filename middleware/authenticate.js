const pool = require("../config/db");
const jwt = require("jsonwebtoken");

require('dotenv').config()

const authenticate = async (req, res, next) => {
    const publicPaths = ['/login', '/register', 'refreshToken']
    const isPublic = publicPaths.some(path => req.path.endsWith(path))

    if (isPublic) {
        return next()
    }

    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(403).json({
            success: false,
            message: 'No access token. Log in'
        })
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

        req.user = decoded.userInfo

        next()
    } catch (error) {
        console.error(error)
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired access token'
        })
    }
};

module.exports = authenticate;