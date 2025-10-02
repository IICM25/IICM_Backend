const db = require('../config/db');
const mysql = require('mysql2');

async function getAParticipantData(email){
  const query = `SELECT * FROM participants WHERE email = ?`;
  const [rows] = await db.execute(query, [email]);
  return rows[0];
}

module.exports = {getAParticipantData};
