const db = require('../config/db');

// Base Urgency Score Mappings — must match every possible issue_type string
// returned by the AI classifiers in services/ai-service/*.py
const URGENCY_WEIGHTS = {
  // Water Works (base 90)
  'water leakage': 90,
  'water_leakage': 90,
  'no water supply': 90,
  'sewer overflow': 90,
  'burst pipe': 90,
  'flooded street': 90,
  'contaminated water': 90,
  'drainage block': 90,
  'waterlogging': 90,
  'dirty water': 90,

  // Electrical Works (base 80)
  'street light not working': 80,
  'streetlight_outage': 80,
  'electric pole damage': 80,
  'electrical_hazard': 80,
  'loose hanging wires': 80,
  'sparking electricity': 80,
  'power outage': 80,
  'broken street lamp': 80,
  'transformer issue': 80,

  // Public Works / Road (base 70)
  'pothole': 70,
  'pot hole': 70,
  'pot_hole': 70,
  'road_damage': 70,
  'damaged road': 70,
  'broken footpath': 70,
  'cracked pavement': 70,
  'sinkhole': 70,
  'road cave-in': 70,
  'unpaved road': 70,
  'uneven street surface': 70,
  'bridge damage': 70,

  // Sanitation / Garbage (base 60)
  'garbage accumulation': 60,
  'garbage_accumulation': 60,
  'garbage': 60,
  'waste': 60,
  'trash pile': 60,
  'littering': 60,
  'dead animal on road': 60,
  'overflowing dustbin': 60,
  'foul smell': 60,
  'plastic waste': 60,

  // Public cleanliness (base 50)
  'unclean street': 50,
  'public_cleanliness': 50,
  'public toilet unhygienic': 50,
  'cleanliness': 50
};
const DEFAULT_URGENCY_WEIGHT = 40;

/**
 * Calculates the priority score and its sub-factors for a complaint.
 * @param {string} issue_type - The AI-classified issue type
 * @param {number} ward_id   - The ward the complaint belongs to
 * @returns {Promise<{priority_score: number, urgency_score: number, impact_score: number, recurrence_score: number}>}
 */
const calculatePriority = async (issue_type, ward_id) => {
    try {
        // 1. Urgency Score — based on issue type
        const normalizedType = (issue_type || 'unknown').toLowerCase().replace(/ /g, '_');
        const urgency_score = URGENCY_WEIGHTS[normalizedType] || DEFAULT_URGENCY_WEIGHT;

        // 2. Impact Score — how many similar complaints in the same ward in the last 48 hours
        const impactRes = await db.query(
            `SELECT COUNT(*) AS count FROM complaints
             WHERE issue_type = $1 AND ward_id = $2
               AND created_at >= NOW() - INTERVAL '48 hours'`,
            [issue_type, ward_id]
        );
        const count48h = parseInt(impactRes.rows[0].count, 10) || 0;
        const impact_score = Math.log10(count48h + 1) * 20;

        // 3. Recurrence Score — how many similar complaints in the same ward in the last 7 days
        const recurrenceRes = await db.query(
            `SELECT COUNT(*) AS count FROM complaints
             WHERE issue_type = $1 AND ward_id = $2
               AND created_at >= NOW() - INTERVAL '7 days'`,
            [issue_type, ward_id]
        );
        const count7d = parseInt(recurrenceRes.rows[0].count, 10) || 0;
        const recurrence_score = Math.min(count7d * 5, 30);

        // 4. Add a random variation factor so identical complaints don't stack with the exact same score
        let random_factor = Math.random() * 4; // Add a random value between 0 and 4

        // 5. Final priority score (0-100)
        let priority_score = (0.5 * urgency_score) + (0.3 * impact_score) + (0.2 * recurrence_score) + random_factor;
        priority_score = Math.min(Math.round(priority_score * 100) / 100, 100);

        return {
            priority_score,
            urgency_score,
            impact_score: Math.round(impact_score * 100) / 100,
            recurrence_score
        };
    } catch (error) {
        console.error('Error calculating priority score:', error);
        let random_fallback = Math.random() * 4;
        return {
            priority_score: Math.min(Math.round(((DEFAULT_URGENCY_WEIGHT * 0.5) + random_fallback) * 100) / 100, 100),
            urgency_score: DEFAULT_URGENCY_WEIGHT,
            impact_score: 0,
            recurrence_score: 0
        };
    }
};

module.exports = { calculatePriority };
