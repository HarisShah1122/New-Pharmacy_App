require('dotenv').config();
const express = require('express');
const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
const { validationResult } = require('express-validator');
const validateUser = require('./helpers/validateUser'); 

const User = require('./models/Users');
const Prescription = require('./models/Prescription');

const healthAuthorityController = require('./controllers/healthAuthorityController');
const diagnosisListController = require('./controllers/DiagnosisListController');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || '8Kj9mPq2v';

// Middleware to check token
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
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Auth Routes
app.post('/signup', validateUser, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { firstname, lastname, email, password, healthAuthority } = req.body;

    // Additional check for required fields (redundant but ensures robustness)
    if (!firstname || !lastname || !email || !password || !healthAuthority) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = await User.create({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      healthAuthority: healthAuthority.trim(),
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
    });
  } catch (error) {
    console.error('Signup error:', error);
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
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({
      message: 'User successfully logged in',
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
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
    console.error('Prescription save error:', error);
    res.status(500).json({ error: 'Failed to save prescription', details: error.message });
  }
});

app.get('/home', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome ${req.user.email}!` });
});

// Other Controllers
healthAuthorityController.controller(app);
diagnosisListController.controller(app);

// Dynamically load controllers
fs.readdirSync('./controllers').forEach((file) => {
  if (file.endsWith('.js')) {
    try {
      const route = require(`./controllers/${file}`);
      if (typeof route.controller === 'function') {
        route.controller(app);
      } else {
        console.error(`Skipping ${file}: no valid controller function`);
      }
    } catch (err) {
      console.error(`Failed to load ${file}: ${err.message}`);
    }
  }
});

// Start Server
const port = process.env.PORT || 8081; // Use config port
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('❌ Unable to connect to the database:', error);
  });