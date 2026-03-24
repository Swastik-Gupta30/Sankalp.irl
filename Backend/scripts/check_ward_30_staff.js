const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function checkWardStaff() {
    let output = {};
    try {
        const staffRes = await pool.query("SELECT * FROM ward_staff WHERE ward_id = 30");
        output.staff = staffRes.rows;
    } catch(e) {
        output.staff_error = e.message;
    }
    fs.writeFileSync('ward_staff_check.json', JSON.stringify(output, null, 2));
    console.log("Check complete.");
    pool.end();
}

checkWardStaff();
