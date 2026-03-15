const db = require('./config/db');

async function debugComplaints() {
    try {
        const res = await db.query('SELECT id, ward_id, latitude, longitude, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 10');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const wards = await db.query('SELECT id, ward_name, ST_AsText(polygon_geometry) FROM wards WHERE id = 1 OR id = 36');
        console.log('--- Wards ---');
        console.log(JSON.stringify(wards.rows, null, 2));
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debugComplaints();
