const winston = require('winston');
const path = require('path');

const consoleFormat = winston.format.printf(({ level, message }) => {
    return `${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'info',

    transports: [
        // Console: mensaje normal
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                consoleFormat
            )
        }),

        // File: JSON completo
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs', 'app.log'),
            
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

module.exports = logger;

