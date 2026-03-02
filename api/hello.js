module.exports = (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Native Vercel Function (Diagnostic)',
        node_version: process.version,
        time: new Date().toISOString()
    });
};
