// email.js

const nodemailer = require('nodemailer');

function sendVerificationEmail(email, verificationToken) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'blogproject164@gmail.com',
            pass: 'xlutioizabhdjqhs',
        },
    });
    

    const verificationLink = `http://localhost:2345/verify?token=${verificationToken}`;


    const mailOptions = {
        from: 'blogproject164@gmail.com',
        to: email,
        subject: 'Verify Your Email',
        html: `<p>Click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
        } else {
            console.log('Verification email sent:', info.response);
            console.log(`Verification email sent to ${mailOptions.to} with token ${verificationToken}`);
        }
    });
}

module.exports = { sendVerificationEmail };
