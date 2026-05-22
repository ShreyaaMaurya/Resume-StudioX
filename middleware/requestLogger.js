// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    // Log response completion
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
        
        if (res.statusCode >= 400) {
            console.error(log);
        } else {
            console.log(log);
        }
    });

    next();
};

module.exports = requestLogger;
