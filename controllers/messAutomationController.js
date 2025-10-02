const db = require("../config/db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

const getData=async (req,res)=>{
    const email= req.body.email;
    console.log(email)
    try{
        const query = `SELECT * FROM participants WHERE email = ?`;
        const [rows] = await db.execute(query, [email]);
        // console.log(rows)
        if(rows.length==0) res.status(404).json({message : 'No record found'})
        else {
            
            const breakfastTimeStampStart = getTodayAtTime(7).getTime();
            const breakfastTimeStampEnd = getTodayAtTime(10).getTime();
            const lunchTimeStampStart = getTodayAtTime(12).getTime();
            const lunchTimeStampEnd = getTodayAtTime(15).getTime();
            const dinnerTimeStampStart = getTodayAtTime(19).getTime();
            const dinnerTimeStampEnd = getTodayAtTime(22).getTime();
            const currentTimeStamp = Date.now();
            const mealType = (currentTimeStamp >= breakfastTimeStampStart && currentTimeStamp <= breakfastTimeStampEnd) ? 'breakfast' : (currentTimeStamp >= lunchTimeStampStart && currentTimeStamp <= lunchTimeStampEnd) ? 'lunch' : (currentTimeStamp >= dinnerTimeStampStart && currentTimeStamp <= dinnerTimeStampEnd) ? 'dinner' : 'nothing';
            if(rows[0].last_meal==null){
                res.status(200).json({data : rows[0], isValidStudent : true, mealType : mealType})
                return;
            }
            let isValidStudent = false;
            const myTimeStamp = rows[0].last_meal.getTime();
            if(myTimeStamp<1733924073000){
                res.status(404).json({message : 'No record found'})
                return;
            }

            if(currentTimeStamp >= breakfastTimeStampStart && currentTimeStamp <= breakfastTimeStampEnd){
                if(myTimeStamp < breakfastTimeStampStart || myTimeStamp > breakfastTimeStampEnd){
                    isValidStudent = true;
                }
            }
            else if(currentTimeStamp >= lunchTimeStampStart && currentTimeStamp <= lunchTimeStampEnd){
                if(myTimeStamp < lunchTimeStampStart || myTimeStamp > lunchTimeStampEnd){
                    isValidStudent = true;
                }
            } else if(currentTimeStamp >= dinnerTimeStampStart && currentTimeStamp <= dinnerTimeStampEnd){
                if(myTimeStamp < dinnerTimeStampStart || myTimeStamp > dinnerTimeStampEnd){
                    isValidStudent = true;
                }
            }
            res.status(200).json({data : rows[0], isValidStudent : isValidStudent, mealType : mealType})
        }
    } catch(e){
        console.log(e)
        res.status(500).json({error: e});
    }
}

function getTodayAtTime(hours, minutes=0, seconds = 0) {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      seconds
    );
  }

const approveStudent=async (req,res)=>{
    const email= req.body.email;
    const hall= req.body.hall;
    console.log(email)
    console.log(hall)
    try{
        const currentDate = new Date();
        const breakfastTimeStampStart = getTodayAtTime(7).getTime();
        const breakfastTimeStampEnd = getTodayAtTime(10).getTime();
        const lunchTimeStampStart = getTodayAtTime(12).getTime();
        const lunchTimeStampEnd = getTodayAtTime(15).getTime();
        const dinnerTimeStampStart = getTodayAtTime(19).getTime();
        const dinnerTimeStampEnd = getTodayAtTime(22).getTime();
        const currentTimeStamp = Date.now();
        const countMealTableRowId = (currentTimeStamp >= breakfastTimeStampStart && currentTimeStamp <= breakfastTimeStampEnd) ? 1 : (currentTimeStamp >= lunchTimeStampStart && currentTimeStamp <= lunchTimeStampEnd) ? 2 : (currentTimeStamp >= dinnerTimeStampStart && currentTimeStamp <= dinnerTimeStampEnd) ? 3 : 4;
        const day = currentDate.getDate();
        const countMealTableColumnName = "day_" + day;
        // Adjust to IST (UTC+5:30)
        const offset = 5.5 * 60 * 60 * 1000; // IST is 5 hours 30 minutes ahead of UTC
        const istDate = new Date(currentDate.getTime() + offset);


        // Format the IST date to 'YYYY-MM-DD HH:MM:SS'
        const formattedDate = istDate.toISOString().slice(0, 19).replace('T', ' ');
        const query = `UPDATE participants SET last_meal = '${formattedDate}' WHERE email = ?`;
        const query2 = `UPDATE ${hall} SET ${countMealTableColumnName} = ${countMealTableColumnName}+1 WHERE id = '${countMealTableRowId}'`;

        // const query2 = `UPDATE mealCount SET ${countMealTableColumnName} = ${countMealTableColumnName}+1 WHERE id = '${countMealTableRowId}'`;
        const [rows] = await db.execute(query, [email]);
        // if(countMealTableRowId<4){
        const [rows2] = await db.execute(query2);
        // }
        if(rows.length==0) res.status(404).json({message : 'No record found'})
        else {
            res.status(200).json({message : 'Approved'})
        }
    } catch(e){
        console.log(e)
        res.status(500).json({error: e});
    }
}

const loginMessUser = async (req, res) => {

    const { email, password } = req.body;
    console.log('Logging in user:', email);
    console.log('Logging in user:', password);
    const query = 'SELECT password FROM mess_users WHERE email = ?';
    try{
        const results = await db.query(query, [email]);
        if (results.length === 0) {return res.status(400).send('User not found');}
        console.log(results);
        const hashedPassword = results[0][0].password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (isMatch) {
            const token = jwt.sign({ email: email }, secretKey);
            res.send({ message: 'Login successful', token: token });
        } else {
            res.status(400).send('Incorrect password');
        }
    }catch(e){
        console.log(e);
        res.status(500).send('Error logging in');
    }

}

const getMealCount = async (req,res)=>{
    const hall = req.query.hall;
    // const hall= req.body.hall;
    console.log(hall)
    try{
        const currentDate = new Date();
        const day = currentDate.getDate();
        const countMealTableColumnName = "day_" + day;
        const _hall = mysql.escapeId(hall);
        const query = `SELECT ${countMealTableColumnName} FROM ${hall}`;
        const results = await db.query(query);
        if (results.length === 0) {return res.status(400).send('No data found');}
        const breakfast = results[0][0][countMealTableColumnName];
        const lunch = results[0][1][countMealTableColumnName];
        const dinner = results[0][2][countMealTableColumnName];
        res.status(200).json({breakfast : breakfast, lunch : lunch, dinner : dinner});
        console.log(results);
    }
    catch(e){
        console.log(e);
        res.status(500).send('Error fetching data');
    }
}



module.exports = {getData,approveStudent, loginMessUser, getMealCount};