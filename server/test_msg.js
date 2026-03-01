const axios = require('axios');
async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/messages', {
            userId: 'test_user_123',
            userName: 'Test User',
            userEmail: 'test@example.com',
            text: 'Hello test message!',
            isAdmin: false
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Fail:', e.response ? e.response.status : e.message);
    }
}
test();
