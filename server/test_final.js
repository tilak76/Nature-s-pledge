const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('Using URI from .env:', process.env.MONGO_URI.replace(/:.+@/, ':****@'));

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
        console.log('--- CONNECT SUCCESS! ---');
    } catch (err) {
        console.log('--- CONNECT FAILED! ---');
        console.log('Error:', err.message);
    }
    process.exit(0);
}
test();
