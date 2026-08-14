const logger = require('../config/logger')

const LOGGABLE_STATUS_CODES = new Set([
    400,
    401,
    403,
    404,
    409,
    422,
    500,
    503
]);

const errorHandler = (err, req, res, next) => {
    if(LOGGABLE_STATUS_CODES.has(err.statusCode || 500)){
    logger.error(err.message, {
        name: err.name,
            data: err.data,
            stack: err.stack,

            method: req.method,
            url: req.originalUrl,
            ip: req.ip,

            statusCode: err.statusCode || 500,

            code: err.code || "INRERNAL_ERROR"
        });
    };
    
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || "INTERNAL_ERROR",
            message: 
                statusCode === 500
                ? "Internal server error"
                : err.message
        }
    });
};

module.exports = errorHandler;