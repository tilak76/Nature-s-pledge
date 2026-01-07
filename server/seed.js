const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const products = [
    {
        name: "Premium Kashmiri Walnuts (inshell)",
        description: "High-quality organic Kashmiri walnuts with thin shell.",
        price: 500,
        image: "https://images.unsplash.com/photo-1557929036-74a0d8c2794c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2FsbnV0fGVufDB8fDB8fHww",
        category: "Walnut",
        stock: 50
    },
    {
        name: "California Walnuts (Kernels)",
        description: "Fresh and crunchy walnut kernels from California.",
        price: 1200,
        image: "https://images.unsplash.com/photo-1628148902506-691a5470877a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8d2FsbnV0c3xlbnwwfHwwfHx8MA%3D%3D",
        category: "Walnut",
        stock: 100
    },
    {
        name: "Organic Akhroth Giri",
        description: "100% Organic Walnut Kernels, rich in Omega-3.",
        price: 1500,
        image: "https://plus.unsplash.com/premium_photo-1675237626068-bf404ecdc573?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fHdhbG51dHN8ZW58MHx8MHx8fDA%3D",
        category: "Walnut",
        stock: 30
    },
    {
        name: "Roasted Salted Walnuts",
        description: "Perfectly roasted and lightly salted for a healthy snack.",
        price: 1350,
        image: "https://images.unsplash.com/photo-1596667104860-9118c7280142?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHdhbG51dHN8ZW58MHx8MHx8fDA%3D",
        category: "Walnut",
        stock: 80
    }
];

const seedDB = async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Database Seeded!');
    mongoose.connection.close();
};

seedDB();
