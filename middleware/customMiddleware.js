const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get the extension of a url/file
exports.fileExtension = (url) => { return url.split('.').pop().split(/\#|\?/)[0] }

// Verify token
exports.verifyToken = (req, res, next) => {
    const { token } = req.headers
    // Return forbidden status if the token is not available
    if (!token) {
        return res.status(403).json({ authorized: false, error: 'This is required' })
    }

    // Verify Token
    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ authorized: false, error: 'Verification failed or token has expired.' })
        }

        // No error, save decoded token into req.user and get to next process
        req.user = decoded;
        next();
    })
}