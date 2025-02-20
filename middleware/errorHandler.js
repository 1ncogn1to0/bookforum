module.exports = (err, req, res, next) => {
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
    res.status(500).json({ message: 'Internal Server Error' });
};