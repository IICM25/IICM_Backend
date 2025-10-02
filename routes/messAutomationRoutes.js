const express = require("express");
const { getData, approveStudent, loginMessUser, getMealCount } = require("../controllers/messAutomationController");
const router = express.Router();
const authenticateToken = require("../middlewares/messMiddleWare");
const bcrypt = require('bcrypt');
const db = require("../config/db");
const saltRounds = 10;

router.post('/loginMessUser', loginMessUser);
router.post('/playerDetails',authenticateToken, getData)
router.post('/approveStudent',authenticateToken, approveStudent)
router.get('/mealCount', getMealCount)

module.exports = router;