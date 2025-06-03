require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'bronx360-secret-key';

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://codewithniranjan.github.io',
        'https://bronx360-backend.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'bronx360.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create tables if they don't exist
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            issueType TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            latitude REAL,
            longitude REAL,
            adminNotes TEXT DEFAULT NULL,
            createdAt DATETIME DEFAULT (datetime('now')),
            updatedAt DATETIME DEFAULT (datetime('now'))
        )`, (err) => {
            if (err) {
                console.error('Error creating reports table:', err);
            } else {
                console.log('Reports table created or already exists');
            }
        });

        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt DATETIME DEFAULT (datetime('now'))
        )`, (err) => {
            if (err) {
                console.error('Error creating admins table:', err);
            } else {
                console.log('Admins table created or already exists');
            }
        });

        // Always upsert default admin on startup
        (async () => {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            db.run(
                "INSERT OR REPLACE INTO admins (id, username, password) VALUES ((SELECT id FROM admins WHERE username = ?), ?, ?)",
                ['admin', 'admin', hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error upserting default admin:', err);
                    } else {
                        console.log('Default admin ensured');
                    }
                }
            );
        })();
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin login route
app.post('/api/admin/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Missing credentials');
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
            if (err) {
                console.error('Database error during login:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!admin) {
                console.error('Admin not found:', username);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            try {
                const validPassword = await bcrypt.compare(password, admin.password);
                if (!validPassword) {
                    console.error('Invalid password for admin:', username);
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = jwt.sign(
                    { id: admin.id, username: admin.username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                console.log('Login successful for admin:', username);
                res.json({ token });
            } catch (bcryptError) {
                console.error('Password comparison error:', bcryptError);
                return res.status(500).json({ error: 'Authentication error' });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/reports', authenticateToken, (req, res) => {
    db.all('SELECT * FROM reports ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.get('/api/admin/reports/:id', authenticateToken, (req, res) => {
    db.get('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.json(row);
    });
});

app.put('/api/admin/reports/:id', authenticateToken, (req, res) => {
    console.log('Updating report:', req.params.id, req.body);
    const { status, adminNotes } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    // First check if the report exists
    db.get('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, report) => {
        if (err) {
            console.error('Error checking report:', err);
            return res.status(500).json({ 
                error: 'Database error',
                details: err.message 
            });
        }

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Update the report
        const sql = `UPDATE reports 
                     SET status = ?, 
                         adminNotes = ?,
                         updatedAt = datetime('now')
                     WHERE id = ?`;

        console.log('Executing SQL:', sql);
        console.log('Parameters:', [status, adminNotes, req.params.id]);

        db.run(sql, [status, adminNotes, req.params.id], function(err) {
            if (err) {
                console.error('Database error during update:', err);
                return res.status(500).json({ 
                    error: 'Database error',
                    details: err.message 
                });
            }

            if (this.changes === 0) {
                console.error('No rows were updated');
                return res.status(404).json({ error: 'Report not found or no changes made' });
            }

            // Fetch the updated report
            db.get('SELECT * FROM reports WHERE id = ?', [req.params.id], (err, updatedReport) => {
                if (err) {
                    console.error('Error fetching updated report:', err);
                    return res.status(500).json({ 
                        error: 'Error fetching updated report',
                        details: err.message 
                    });
                }

                if (!updatedReport) {
                    console.error('Updated report not found');
                    return res.status(404).json({ error: 'Updated report not found' });
                }

                console.log('Report updated successfully:', updatedReport);
                res.json(updatedReport);
            });
        });
    });
});

// Public routes
app.get('/api/reports', (req, res) => {
    db.all('SELECT * FROM reports ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/reports', (req, res) => {
    console.log('Received report submission:', req.body);
    const { title, description, location, issueType, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!title || !description || !location || !issueType) {
        console.error('Missing required fields:', { title, description, location, issueType });
        return res.status(400).json({ 
            error: 'All fields are required',
            received: { title, description, location, issueType }
        });
    }

    // Validate coordinates
    if (!latitude || !longitude) {
        console.error('Missing coordinates:', { latitude, longitude });
        return res.status(400).json({ 
            error: 'Location coordinates are required',
            received: { latitude, longitude }
        });
    }

    const sql = `INSERT INTO reports (title, description, location, issueType, latitude, longitude, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'open')`;
    
    db.run(sql, [title, description, location, issueType, latitude, longitude], function(err) {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                error: 'Database error',
                details: err.message 
            });
        }

        const newReport = {
            id: this.lastID,
            title,
            description,
            location,
            issueType,
            latitude,
            longitude,
            status: 'open',
            createdAt: new Date().toISOString()
        };

        console.log('Successfully created report:', newReport);
        res.status(201).json(newReport);
    });
});

app.get('/api/reports/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM reports WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Report not found' });
            return;
        }
        res.json(row);
    });
});

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 