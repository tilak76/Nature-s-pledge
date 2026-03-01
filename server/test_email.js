require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const mailOptions = {
    from: `"Test" <${process.env.EMAIL_USER}>`,
    to: 'tilakmishra.76@gmail.com',
    subject: 'Test Email',
    text: 'This is a test email'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log("Email Error:", error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
