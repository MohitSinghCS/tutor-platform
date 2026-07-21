const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User'); // Points directly to our User.js file next to it

const app = express();
app.use(cors());
app.use(express.json());

// Connects to your local MongoDB database
mongoose.connect('mongodb+srv://mohit31025_db_user:RKi4jcdzV0O8Sgfo@sarvshresthcc.jsmcfx5.mongodb.net/tutorPlatform?appName=SarvShresthCC')
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ Database connection error:', err));

// Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ success: true, message: 'Saved to database!', data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    // This tells Mongoose to find ALL users in the database
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));