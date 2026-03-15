const db = require('../config/db');

const migrateUserLocation = async () => {
  try {
    await db.query('BEGIN');

    // 1. Add user location columns safely
    console.log('Adding location columns to users table...');
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,8),
      ADD COLUMN IF NOT EXISTS longitude NUMERIC(11,8),
      ADD COLUMN IF NOT EXISTS ward_id INTEGER REFERENCES wards(id);
    `);

    // 2. Generate 36 realistic ward polygons for Delhi
    // Delhi approximate bounds: Lat 28.4 to 28.8, Lng 77.0 to 77.3
    // 6x6 grid = 36 wards
    console.log('Generating exactly 36 ward polygons for Delhi...');
    
    // First, clear existing geometries to ensure fresh start
    await db.query('UPDATE wards SET polygon_geometry = NULL');
    
    const targetWardsCount = 36;
    const { rows: existingWards } = await db.query('SELECT id FROM wards ORDER BY id');
    
    let wardIds = existingWards.map(w => w.id);
    
    // If we have fewer than 36 wards, insert the missing ones
    if (wardIds.length < targetWardsCount) {
        console.log(`Only found ${wardIds.length} wards. Creating ${targetWardsCount - wardIds.length} more...`);
        for (let i = wardIds.length + 1; i <= targetWardsCount; i++) {
            const res = await db.query(
                'INSERT INTO wards (ward_name, city_id, ward_number) VALUES ($1, 1, $2) RETURNING id',
                [`Ward ${i}`, i.toString()]
            );
            wardIds.push(res.rows[0].id);
        }
    }
    
    // Grid parameters - Wider Delhi bounds to avoid fallbacks
    const minLat = 28.40;
    const maxLat = 28.90; // Expanded from 28.8
    const minLng = 76.80; // Expanded from 77.0
    const maxLng = 77.30; 
    
    
    const latStep = (maxLat - minLat) / 6;
    const lngStep = (maxLng - minLng) / 6;

    let wardIndex = 0;
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            if (wardIndex >= 36 || wardIndex >= wardIds.length) break;
            
            const wardId = wardIds[wardIndex];
            
            const cellMinLat = minLat + (row * latStep);
            const cellMaxLat = minLat + ((row + 1) * latStep);
            const cellMinLng = minLng + (col * lngStep);
            const cellMaxLng = minLng + ((col + 1) * lngStep);
            
            // PostGIS Polygon format: 'POLYGON((x1 y1, x2 y2, x3 y3, x4 y4, x1 y1))' Note: ST_GeomFromText uses Longitude Latitude (X Y)
            const polygonWKT = `POLYGON((${cellMinLng} ${cellMinLat}, ${cellMaxLng} ${cellMinLat}, ${cellMaxLng} ${cellMaxLat}, ${cellMinLng} ${cellMaxLat}, ${cellMinLng} ${cellMinLat}))`;
            
            await db.query(
                `UPDATE wards SET polygon_geometry = ST_GeomFromText($1, 4326) WHERE id = $2`,
                [polygonWKT, wardId]
            );
            
            wardIndex++;
        }
    }
    
    console.log(`Successfully updated ${wardIndex} ward geometries.`);

    await db.query('COMMIT');
    console.log('Migration completed successfully!');
    
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

migrateUserLocation();
