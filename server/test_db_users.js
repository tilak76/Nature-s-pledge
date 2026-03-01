const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/walnut-shop')
    .then(() => {
        return mongoose.connection.db.collection('users').find({}).toArray();
    })
    .then(users => {
        console.log("Mongoose connected. Found " + users.length + " users in DB.");
        users.forEach(u => console.log(u.email || u.phoneNumber, u.role));
        process.exit(0);
    })
    .catch(e => {
        console.error("DB Error:", e);
        process.exit(1);
    });
