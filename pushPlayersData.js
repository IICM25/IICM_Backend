const xlsx = require('xlsx');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();
const iitnames = {
    // bhilai: "IIT BHILAI",
    // bhu: "IIT BHU",
    // bhubaneswar: "IIT BHUBANESWAR",
    // bombay: "IIT BOMBAY",
    // delhi: "IIT DELHI",
    // dharwad: "IIT DHARWAD",
    // dhanbad: "ISM DHANBAD",
    // gandhinagar: "IIT GANDHINAGAR",
    // goa: "IIT GOA",
    // guwahati: "IIT GUWAHATI",
    // hyderabad: "IIT HYDERABAD",
    // indore: "IIT INDORE",
    // jammu: "IIT JAMMU",
    // jodhpur: "IIT JODHPUR",
    // kanpur: "IIT KANPUR",
    // kharagpur: "IIT KHARAGPUR",
    // madras: "IIT MADRAS",
    // mandi: "IIT MANDI",
    // palakkad: "IIT PALAKKAD",
    // patna: "IIT PATNA",
    // roorkee: "IIT ROORKEE",
    // ropar: "IIT ROPAR",
    // tirupati: "IIT TIRUPATI",
    teams: "IIT KANPUR"
};

// MySQL connection (assuming it's already set up and correct)
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// // Load Excel file
const filePath = path.join(__dirname, 'student.xlsx');
// const filePath = path.join(__dirname, '.xlsx');
const workbook = xlsx.readFile(filePath);

// // Select the first sheet
// connection.query('TRUNCATE TABLE players');
// for(let i=0; i<23; i++){
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    let count = 0;
    console.log(sheetName);
    data.forEach(row => {
        count++;
        const _genderFormSheet = row.gender.toUpperCase();
        const genderFormSheet = _genderFormSheet.replace(/\s/g, '');
        const gender = (genderFormSheet[0] === 'M')? 'Male':'Female';

        const name = row.name.toUpperCase();
        const _email = row.email;
        const email = _email.replace(/\s/g, '').toLowerCase();
        
        const eventN = row.eventN.toUpperCase();
        const team = iitnames[sheetName.toLowerCase()];

        // const team = row.team.toUpperCase();
        const uniqueCode = "null";
        const rollNo = "null";
        // const hall_name = row.hall_name;
        const hall_name = "0";
        const sql = `
            INSERT INTO participants (name, email, gender, eventN, team, uniqueCode, rollNo, hall_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(sql, [
            name,
            email,
            gender,
            eventN,
            team,
            uniqueCode,
            rollNo,
            hall_name
        ], (err, results) => {
            if (err) {
                console.log(name,email);
                // console.error('Error inserting row:', err);
            } else {
                console.log('Inserted row with ID:', results.insertId);
            }
        });
    });
    console.log(count);
    console.log();
// }

// // Close the MySQL connection after inserts are done
connection.end((err) => {
    if (err) {
        console.error('Error closing MySQL connection:', err);
    } else {
        console.log('MySQL connection closed.');
    }
});

