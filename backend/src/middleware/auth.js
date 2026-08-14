const jwt = require('jsonwebtoken');
require('dotenv').config()

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if(!token) return res.status(401).json({ error: 'Access denied' })

    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next()
    }catch(error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = auth