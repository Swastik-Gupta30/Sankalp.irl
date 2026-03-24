const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // Load from Backend/.env

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkWard() {
    let output = {};
    try {
        const staffRes = await pool.query("SELECT * FROM users WHERE role = 'ward_staff'");
        output.staff = staffRes.rows;
    } catch(e) {
        output.staff_error = e.message;
    }
    
    try {
        const cbRes = await pool.query("SELECT * FROM civic_bodies");
        output.civic_bodies = cbRes.rows;
    } catch(e) { 
        output.cb_error = e.message; 
    }
    
    try {
        const compRes = await pool.query("SELECT * FROM complaints ORDER BY created_at DESC LIMIT 5");
        output.complaints = compRes.rows;
    } catch(e) {
        output.comp_error = e.message;
    }
    
    try {
        const colRes = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        output.user_columns = colRes.rows;
    } catch(e) {
        output.col_error = e.message;
    }
    
    fs.writeFileSync('db_check.json', JSON.stringify(output, null, 2));
    console.log("Check complete, wrote to db_check.json");
    pool.end();
}

checkWard();
