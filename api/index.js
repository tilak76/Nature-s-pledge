const express = require('express');
const app = express();

app.get('/api/ping', (req, res) => res.json({ status: "Extreme Ping Alive" }));

app.get('*', (req, res) => {
    res.json({
        msg: "Barebones API Base",
        path: req.path,
        env: process.env.NODE_ENV
    });
});

module.exports = app;
