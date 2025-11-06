const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const JWT_SECRET = 'your_jwt_secret'; // Replace with a strong secret

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Create a new database or open an existing one
const db = new sqlite3.Database('./carpool.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the carpool database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    departure_time DATETIME NOT NULL,
    available_seats INTEGER NOT NULL,
    FOREIGN KEY (driver_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ride_passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER NOT NULL,
    passenger_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (ride_id) REFERENCES rides (id),
    FOREIGN KEY (passenger_id) REFERENCES users (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

app.use(express.json());

// User registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.run(sql, [name, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating user.' });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user.' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  });
});


// Get all rides
app.get('/api/rides', (req, res) => {
  const sql = 'SELECT * FROM rides';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.' });
    }
    res.json(rows);
  });
});

// Get a specific ride
app.get('/api/rides/:id', (req, res) => {
  const sql = 'SELECT * FROM rides WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Server error.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Ride not found.' });
    }
    res.json(row);
  });
});

// Create a new ride
app.post('/api/rides', authenticateToken, (req, res) => {
  const { origin, destination, departure_time, available_seats } = req.body;
  const driver_id = req.user.id;

  if (!origin || !destination || !departure_time || !available_seats) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const sql = 'INSERT INTO rides (driver_id, origin, destination, departure_time, available_seats) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [driver_id, origin, destination, departure_time, available_seats], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error creating ride.' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Request to join a ride
app.post('/api/rides/:id/request', authenticateToken, (req, res) => {
  const ride_id = req.params.id;
  const passenger_id = req.user.id;

  const sql = 'INSERT INTO ride_passengers (ride_id, passenger_id) VALUES (?, ?)';
  db.run(sql, [ride_id, passenger_id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error requesting ride.' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// Accept or reject a ride request
app.put('/api/rides/:ride_id/requests/:request_id', authenticateToken, (req, res) => {
  const { status } = req.body;
  const { ride_id, request_id } = req.params;
  const driver_id = req.user.id;

  if (!status || (status !== 'accepted' && status !== 'rejected')) {
    return res.status(400).json({ message: 'Invalid status.' });
  }

  const sql = `
    UPDATE ride_passengers
    SET status = ?
    WHERE id = ? AND ride_id = ? AND ride_id IN (SELECT id FROM rides WHERE driver_id = ?)
  `;

  db.run(sql, [status, request_id, ride_id, driver_id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Error updating request.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Request not found or you are not the driver.' });
    }
    res.json({ message: `Request ${status}.` });
  });
});

// Get user notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = 'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0';

  db.all(sql, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching notifications.' });
    }
    res.json(rows);
  });
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});