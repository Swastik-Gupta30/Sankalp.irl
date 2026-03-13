const db = require('../config/db');

const getMapDataByCity = async (req, res) => {
    try {
        const { city_id } = req.params;

        // Fetch just the coordinates and status for the Leaflet frontend map
        const query = `
            SELECT id, latitude, longitude, status, issue_type
            FROM complaints
            WHERE city_id = $1
        `;

        const mapData = await db.query(query, [city_id]);

        res.json(mapData.rows);
    } catch (error) {
        console.error('Error fetching map data:', error);
        res.status(500).json({ message: 'Server error retrieving map data' });
    }
};

module.exports = {
   getMapDataByCity
};
