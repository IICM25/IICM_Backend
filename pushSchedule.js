const xlsx = require('xlsx');
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config();


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

// Load Excel file
const filePath = path.join(__dirname, 'events.xlsx');
const workbook = xlsx.readFile(filePath);

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
const data = xlsx.utils.sheet_to_json(worksheet);

// Function to insert data into MySQL events table
const insertEvents = () => {
    const sql = `
        INSERT INTO events (name, description, date, start_time, end_time, venue, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    console.log('Inserting rows...');
    connection.query('TRUNCATE TABLE events');

    data.forEach(row => {
        const startTime = row.start_time;
        const formattedStartTime = formatAsHHMMSS(startTime);
        const endTime = row.end_time;
        const formattedEndTime = formatAsHHMMSS(endTime);
        const createdAt = new Date();
        const formattedDate = formatDate(row.date);

        // console.log(row.date);
        connection.query(sql, [
            row.name.toUpperCase(),
            row.description.toUpperCase(),
            formattedDate,
            formattedStartTime,
            formattedEndTime,
            row.venue,
            createdAt
        ], (err, results) => {
            if (err) {
                console.error('Error inserting row:', err);
            } else {
                console.log('Inserted row with ID:', results.insertId);
            }
        });
    });
};

// Call the function to insert the data
insertEvents();

// Close the MySQL connection after inserts are done
connection.end((err) => {
    if (err) {
        console.error('Error closing MySQL connection:', err);
    } else {
        console.log('MySQL connection closed.');
    }
});

function formatDate(dateString) {
  // Splits '10/07/2025' into ['10', '07', '2025']
  const parts = dateString.split('/');
  const month = parts[0];
  const day = parts[1];
  const year = parts[2];

  // Reassembles into '2025-10-07'
  return `${year}-${month}-${day}`;
}

function formatAsHHMMSS(decimal) {
    const totalHours = decimal * 24;
    const hours = Math.floor(totalHours);
    
    const totalMinutes = (totalHours - hours) * 60;
    const minutes = Math.floor(totalMinutes);
    
    const totalSeconds = (totalMinutes - minutes) * 60;
    const seconds = Math.round(totalSeconds); // Round to nearest second
  
    // Format as HH:MM:SS
    const formattedTime = [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].join(':');
  
    return formattedTime;
  }
  
