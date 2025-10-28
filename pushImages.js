// Import necessary libraries
const { google } = require('googleapis');
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const stream = require('stream');
const xlsx = require('xlsx'); 
const path = require('path');
require('dotenv').config();


const CONFIG = {
  LOCAL_EXCEL_FILE: './student.xlsx',
  COLUMN_MAPPING: {
    email: 'email',
    googleDriveLink: 'image' 
  },
  MYSQL: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false 
    }
  },
  FIREBASE_BUCKET_URL: process.env.FIREBASE_BUCKET,
  FIREBASE_CREDENTIALS: './firebase-credentials.json',
  GOOGLE_CREDENTIALS: './google-credentials.json' 
};
// Initialize Firebase Admin
const firebaseServiceAccount = require(CONFIG.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  storageBucket: CONFIG.FIREBASE_BUCKET_URL
});
const bucket = admin.storage().bucket();

// Initialize Google APIs
const auth = new google.auth.GoogleAuth({
  keyFile: CONFIG.GOOGLE_CREDENTIALS,
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly'
  ]
});
const drive = google.drive({ version: 'v3', auth });


function getDriveFileIdFromUrl(url) {
  if (!url) return null;
  const match = url.match(/id=([a-zA-Z0-9_-]+)/) || url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}


async function transferFile(fileId, destinationPath, uuidv4) {
  console.log(`    Transferring file: ${fileId}`);

  const fileMeta = await drive.files.get({
    fileId: fileId,
    fields: 'name, mimeType'
  });

  const driveStream = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'stream' }
  );

  const file = bucket.file(destinationPath);

  const passthroughStream = new stream.PassThrough();
  driveStream.data.pipe(passthroughStream);

  const downloadToken = uuidv4();

  const uploadPromise = new Promise((resolve, reject) => {
    passthroughStream.pipe(file.createWriteStream({
      metadata: {
        contentType: fileMeta.data.mimeType,
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    }))
    .on('error', (err) => {
      console.error(`    Upload failed: ${err.message}`);
      reject(err);
    })
    .on('finish', () => {
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destinationPath)}?alt=media&token=${downloadToken}`;
      resolve(url);
    });
  });

  return uploadPromise;
}

async function main() {
  const { v4: uuidv4 } = await import('uuid');

  let db;
  try {
    db = await mysql.createConnection(CONFIG.MYSQL);
    console.log('Connected to MySQL database.');

    console.log(`Reading data from ${CONFIG.LOCAL_EXCEL_FILE}...`);
    const workbook = xlsx.readFile(CONFIG.LOCAL_EXCEL_FILE);

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n--- Processing Sheet: "${sheetName}" ---`);

      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (!rows || rows.length === 0) {
        console.log(`  No data found in sheet "${sheetName}". Skipping.`);
        continue;
      }

      console.log(`  Found ${rows.length} rows to process.`);

      for (const row of rows) {
        const email = row[CONFIG.COLUMN_MAPPING.email];
        const driveLink = row[CONFIG.COLUMN_MAPPING.googleDriveLink];

        if (!email || !driveLink) {
          console.warn('  Skipping row, missing email or drive link.', row);
          continue;
        }

        console.log(`  Processing user: ${email}`);

        const [users] = await db.execute('SELECT image FROM participants WHERE email = ?', [email]);

        if (users.length > 0 && users[0].image) {
          console.log(`    Skipping, image URL already exists.`);
          continue;
        }

        const fileId = getDriveFileIdFromUrl(driveLink);
        if (!fileId) {
          console.error(`    Could not parse Drive ID from link: ${driveLink}`);
          continue;
        }

        const fileExtensionMatch = fileId.match(/\.([^.]+)$/);
        const fileExtension = fileExtensionMatch ? fileExtensionMatch[1] : 'jpg';

        const firebasePath = `${sheetName}/${email.replace(/@/g, '_')}.${fileExtension}`;

        console.log(`    Uploading to: ${firebasePath}`);
        const downloadUrl = await transferFile(fileId, firebasePath, uuidv4);

        await db.execute('UPDATE participants SET image = ? WHERE email = ?', [downloadUrl, email]);
        console.log(`    Successfully updated MySQL for ${email}`);
      }
    }

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    if (db) {
      await db.end();
      console.log('\nMySQL connection closed. Process finished.');
    }
  }
}

main();