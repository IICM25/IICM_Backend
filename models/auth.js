const crypto = require('crypto');
const sendEmail = require('../controllers/emailService');

// Store OTPs temporarily (use a more persistent store for production)
const otpStorage = {};
const otpExpirationTime = 5 * 60 * 1000; // 5 minutes

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}


async function sendOtp(contact) {
    const otp = generateOTP();
    const email = contact.replace(/\s+/g, '');
    const expiration = Date.now() + otpExpirationTime;
    console.log(`Generated OTP for ${email}: ${otp}, expires at ${new Date(expiration)}`);
    otpStorage[email] = { otp, expiration };
    if (email.includes('@')) {
        await sendEmail(contact, 'Your OTP Code', `Your OTP code is ${otp} to login to the Inter IIT Cultural Meet '25 App.\n\nThis OTP is valid for 5 minutes.\n\nPlease do not share this OTP with anyone.\n\nThank you.\nInter IIT Cultural Meet '25 Team`);
    }
}

async function verifyOtp(contact, otp) {
    const email = contact.replace(/\s+/g, '');
    const storedOtpData = otpStorage[email];

    // Check if OTP exists for the contact
    if (!storedOtpData) {
        console.log(`No OTP found for email: ${storedOtpData}`);
        return false;
    }
    const { otp: storedOtp, expiration } = storedOtpData;

    // Check if OTP has expired
    if (Date.now() > expiration) {
        console.log(`OTP for contact ${email} has expired.`);
        delete otpStorage[email]; // Delete expired OTP
        return false;
    }

    // Compare stored OTP with the provided OTP (convert to string if necessary)
    const isValid = String(storedOtp) === String(otp);
    
    if (!isValid) {
        console.log(`Invalid OTP for contact: ${email}`);
        return false;
    }

    // OTP is valid, remove it from storage after successful verification
    delete otpStorage[email];
    console.log(`OTP verified for contact: ${email}`);
    return true;
}


module.exports = { sendOtp, verifyOtp };
