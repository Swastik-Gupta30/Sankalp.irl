import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ---------------------------------------------------------
// Municipal Admin Auth
// ---------------------------------------------------------

export const registerAdmin = async (req, res) => {
    const { gov_email, password, city_id } = req.body;

    if (!gov_email.endsWith('.gov.in')) {
        return res.status(400).json({ error: 'Email must end with .gov.in' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO municipal_admins (gov_email, password_hash, city_id) VALUES ($1, $2, $3) RETURNING id, gov_email, city_id',
            [gov_email, password_hash, city_id]
        );

        const newAdmin = result.rows[0];
        const token = generateToken(newAdmin.id, 'admin');

        res.status(201).json({ admin: newAdmin, token });
    } catch (error) {
        console.error("Admin Registration Error:", error);
        res.status(400).json({ error: 'Registration failed. Email might already exist.' });
    }
};

export const loginAdmin = async (req, res) => {
    const { gov_email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM municipal_admins WHERE gov_email = $1', [gov_email]);
        const admin = result.rows[0];

        if (admin && (await bcrypt.compare(password, admin.password_hash))) {
            const token = generateToken(admin.id, 'admin');
            res.json({ admin: { id: admin.id, gov_email: admin.gov_email, city_id: admin.city_id }, token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// ---------------------------------------------------------
// Ward Staff Auth
// ---------------------------------------------------------

export const registerStaff = async (req, res) => {
    const { gov_email, password, city_id, ward_id, civic_body_id } = req.body;

    if (!gov_email.endsWith('.gov.in')) {
        return res.status(400).json({ error: 'Email must end with .gov.in' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO ward_staff (gov_email, password_hash, city_id, ward_id, civic_body_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, gov_email, city_id, ward_id, civic_body_id',
            [gov_email, password_hash, city_id, ward_id, civic_body_id]
        );

        const newStaff = result.rows[0];
        const token = generateToken(newStaff.id, 'staff');

        res.status(201).json({ staff: newStaff, token });
    } catch (error) {
        console.error("Staff Registration Error:", error);
        res.status(400).json({ error: 'Registration failed. There might already be a staff member for this ward and civic department, or email exists.' });
    }
};

export const loginStaff = async (req, res) => {
    const { gov_email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM ward_staff WHERE gov_email = $1', [gov_email]);
        const staff = result.rows[0];

        if (staff && (await bcrypt.compare(password, staff.password_hash))) {
            const token = generateToken(staff.id, 'staff');
            res.json({ staff: { id: staff.id, gov_email: staff.gov_email, city_id: staff.city_id, ward_id: staff.ward_id, civic_body_id: staff.civic_body_id }, token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("Staff Login Error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
};

// ---------------------------------------------------------
// User (Citizen) Auth
// ---------------------------------------------------------

export const registerUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, trust_score',
            [email, password_hash]
        );

        const newUser = result.rows[0];
        const token = generateToken(newUser.id, 'user');

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error("User Registration Error:", error);
        res.status(400).json({ error: 'Registration failed. Email might already exist.' });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && (await bcrypt.compare(password, user.password_hash))) {
            const token = generateToken(user.id, 'user');
            res.json({ user: { id: user.id, email: user.email, trust_score: user.trust_score }, token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error("User Login Error:", error);
        res.status(500).json({ error: 'Login failed' });
    }
};
