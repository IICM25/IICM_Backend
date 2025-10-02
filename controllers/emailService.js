const nodemailer = require('nodemailer');

console.log("--- CHECKING CREDENTIALS ---");
console.log("Email User Loaded:", process.env.EMAIL_USER);
console.log("Email Pass Loaded:", process.env.EMAIL_PASS ? 'Exists' : '!!! MISSING !!!');
console.log("----------------------------");
// Set up transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
