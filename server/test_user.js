const axios = require('axios');
async function testUser() {
    try {
        const res = await axios.post('http://localhost:5000/api/users/sync', {
            email: 'tilakmishra.76@gmail.com',
            name: 'Tilak Mishra'
        });
        console.log('Success User Sync:', res.data);
    } catch (e) {
        console.error('Fail User Sync:', e.response ? e.response.status : e.message);
    }
}
testUser();
