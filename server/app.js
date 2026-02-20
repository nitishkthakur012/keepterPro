// server/app.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PGSession = require('connect-pg-simple')(session);
const pool = require('./db');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');



const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());


app.use(session({
    store: new PGSession({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 } // 30 min
}));

// Routes will go here

app.use('/api/auth', authRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));