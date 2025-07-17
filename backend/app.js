require('dotenv').config();
const express = require('express');
const app = express();
const config = require('./config/config');
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const flash = require('connect-flash');
const User = require('./models/Users');
const Prescription = require('./models/Prescription');
const Clinician = require('./models/Clinicians');
const healthAuthorityController = require('./controllers/healthAuthorityController');
const diagnosisListController = require('./controllers/DiagnosisListController');
const cors = require('cors');
const validation = require('./helpers/validation.request');
const controllers = require('./controllers/HealthAuthorityController');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
controllers.controller(app);

app.use(session({
  secret: process.env.SESSION_SECRET || '8Kj9mPq2v',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: sequelize,
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: 'lax',
  },
}));

if (typeof validation.validateRequestBody === 'function') {
  app.use(validation.validateRequestBody);
} else {
  console.warn('Skipping validateRequestBody middleware; not a function');
}

const JWT_SECRET = process.env.JWT_SECRET || '8Kj9mPq2v';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Public Routes
app.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, healthAuthority } = req.body;
    if (!firstname || !lastname || !email || !password || !healthAuthority) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    const user = await User.create({
      firstname,
      lastname,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      healthAuthority,
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected Routes
app.post('/save_prescription', authenticateToken, async (req, res) => {
  try {
    const prescriptionData = req.body;
    const requiredFields = [
      'erx_no', 'erx_date', 'prescriber_id', 'member_id', 'payer_tpa',
      'emirates_id', 'reason_of_unavailability', 'physician', 'prescription_date',
      'patient_name', 'gender', 'date_of_birth', 'weight', 'mobile', 'email',
      'fill_date', 'drugs', 'diagnoses',
    ];
    for (const field of requiredFields) {
      if (!prescriptionData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    const newPrescription = await Prescription.create(prescriptionData);
    res.status(201).json({ message: 'Prescription saved successfully', id: newPrescription.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save prescription', details: error.message });
  }
});

app.get('/home', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to the Home Page!' });
});

healthAuthorityController.controller(app);
diagnosisListController.controller(app);

fs.readdirSync('./controllers').forEach(function (file) {
  if (file.substr(-3) === '.js') {
    try {
      let route = require('./controllers/' + file);
      if (typeof route.controller !== 'function') {
        console.error(`Error: ${file} does not export a valid controller function`);
      } else {
        route.controller(app);
      }
    } catch (err) {
      console.error(`Failed to load ${file}:`, err.message);
      console.error(err.stack);
    }
  }
});

const port = 8081;
sequelize
  .sync({ force: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });