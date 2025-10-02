const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../models/auth');
const db = require('../config/db');
const { getAParticipantData } = require('../controllers/participantController');
const QRCode = require('qrcode');

const handleSendOtp = async (req, res) => {
    const { contact } = req.body;
    console.log('Request OTP for:', contact);
    const participant = await getAParticipantData(contact);
    if(!participant){
        res.status(404).json('Participant not found!');
    }
    else {
        try {
            await sendOtp(contact);
            res.status(200).send('OTP sent successfully');
        } catch (error) {
            console.error('Error in sending OTP:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } 
}

// Request OTP
router.post('/requestotp', handleSendOtp); 

router.post('/register', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            try {
                const query = 'SELECT * FROM participants WHERE email = ?';
                const [rows] = await db.execute(query, [email]);
                if (rows.length > 0) {
                    const qrUrl = await QRCode.toDataURL(rows[0].email);
                    data = {
                        id: rows[0].id,
                        name: rows[0].name,
                        email: rows[0].email,
                        gender: rows[0].gender,
                        eventN: rows[0].eventN,
                        team: rows[0].team,
                        hall_name: rows[0].hall_name,
                        last_meal: rows[0].last_meal,
                        uniqueCode: rows[0].uniqueCode,
                        rollNo: rows[0].rollNo,
                        type: rows[0].type,
                        id_generation: qrUrl
                    }
                    res.status(200).json({ message: 'OTP verified', participant: data});
                } else {
                    res.status(404).json({ error: 'Participant not found' });
                }
            } catch (dbError) {
                console.error('Database query error:', dbError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
