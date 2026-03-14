const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const { authenticateToken, restrictToRole } = require('../middleware/authMiddleware');

/**
 * POST /welfare/optimize
 * Body: { budget: number, schemes: string or array, wardNumber?: number }
 * Auth: Admin only
 */
router.post('/optimize', authenticateToken, restrictToRole(['admin']), async (req, res) => {
    const { budget = 2000000, schemes = 'all', wardNumber = null } = req.body;

    const schemesArg = Array.isArray(schemes) ? schemes.join(',') : schemes;

    // Feature2 is mounted at /app/Feature2 inside the backend container
    const scriptPath = path.join('/app', 'Feature2', 'main.py');

    const args = [
        scriptPath,
        '--budget', String(budget),
        '--schemes', schemesArg,
    ];

    if (wardNumber !== null && wardNumber !== undefined) {
        const wardNum = parseInt(wardNumber);
        if (wardNum >= 1 && wardNum <= 36) {
            args.push('--ward', String(wardNum));
        }
    }

    console.log(`[Welfare] Spawning: python3 ${args.join(' ')}`);

    let stdoutData = '';
    let stderrData = '';
    let responded = false; // ← Guard against double responses

    const pythonProcess = spawn('python3', args, {
        cwd: path.join('/app', 'Feature2'),
    });

    pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
        process.stdout.write(`[Python] ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
        if (responded) return;
        responded = true;

        if (code !== 0) {
            console.error(`[Welfare] Python exited with code ${code}. Stderr: ${stderrData.slice(-300)}`);
            return res.status(500).json({
                message: 'Optimization script failed',
                error: stderrData.slice(-500),
            });
        }

        try {
            const trimmed = stdoutData.trim();
            const lastLine = trimmed.split('\n').pop();
            const result = JSON.parse(lastLine);

            if (result.error) {
                return res.status(400).json({ message: result.error });
            }

            console.log(`[Welfare] Done. Beneficiaries: ${result.stats?.basic?.total_beneficiaries}`);
            return res.json(result);
        } catch (e) {
            console.error('[Welfare] JSON parse error:', stdoutData.slice(-300));
            return res.status(500).json({
                message: 'Failed to parse optimizer output',
                raw: stdoutData.slice(-500),
            });
        }
    });

    pythonProcess.on('error', (err) => {
        if (responded) return;
        responded = true;
        console.error('[Welfare] Failed to start Python process:', err.message);
        return res.status(500).json({ message: 'Could not start optimizer. Python3 may not be available.', error: err.message });
    });
});

/**
 * GET /welfare/wards
 * Returns the 36 Delhi wards
 */
router.get('/wards', authenticateToken, restrictToRole(['admin']), (req, res) => {
    const wards = Array.from({ length: 36 }, (_, i) => ({
        wardNumber: i + 1,
        name: `Ward ${i + 1}`,
    }));
    res.json({ wards });
});

module.exports = router;
