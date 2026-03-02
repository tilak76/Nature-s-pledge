module.exports = (req, res) => {
    res.json({
        status: "success",
        msg: "Standalone Ping Function Alive",
        timestamp: new Date().toISOString()
    });
};
