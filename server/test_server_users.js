const express = require('express');
const app = express();
app.use(express.json());
const router = require('./routes/users');
app.use('/api/users', router);
app.listen(5001, () => {
    console.log('Test Server on 5001');
});
