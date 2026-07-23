const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Resend } = require('resend'); // 👈 Import Resend
const User = require('./User'); 

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Connects to your MongoDB database
mongoose.connect('mongodb+srv://mohit31025_db_user:RKi4jcdzV0O8Sgfo@sarvshresthcc.jsmcfx5.mongodb.net/tutorPlatform?appName=SarvShreshthCC')
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ Database connection error:', err));

// Registration Endpoint with Resend HTTP Notification
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    const subjectsList = Array.isArray(req.body.subjects) 
      ? req.body.subjects.join(', ') 
      : (req.body.subjects || 'N/A');

    // Send email via Resend HTTP API (Bypasses Render's port blocks)
    try {
      await resend.emails.send({
        from: 'Sarv Shreshth Alerts <onboarding@resend.dev>', // Free tier default verified domain
        to: 'sscoachingclasses123@gmail.com', // Your target inbox
        subject: `🚨 New ${req.body.role ? req.body.role.toUpperCase() : 'USER'} Registration: ${req.body.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
            <h2 style="color: #ea580c; margin-top: 0;">🎓 New Registration Alert!</h2>
            <p style="font-size: 14px; color: #475569;">A new submission was just received on <strong>Sarv Shreshth Coaching Classes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; font-weight: bold; width: 150px;">Account Category:</td><td style="text-transform: uppercase; color: #0284c7;">${req.body.role || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Full Name:</td><td>${req.body.fullName || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Class / Grade:</td><td>${req.body.classGrade || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Academic Stream:</td><td>${req.body.stream || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Selected Subjects:</td><td>${subjectsList}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Learning Mode:</td><td>${req.body.mode === 'home_tutor' ? '🏡 Home Tutor' : '🏫 Coaching Class'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Phone Number:</td><td><a href="https://wa.me/91${req.body.phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">+91 ${req.body.phone} (WhatsApp Link)</a></td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Email:</td><td>${req.body.email || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0; font-weight: bold;">Location / Address:</td><td>${req.body.locationOrAddress || 'N/A'}</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Sarv Shreshth Automated Portal System</p>
          </div>
        `
      });
      console.log('✉️ Notification email sent successfully via Resend!');
    } catch (mailError) {
      console.error('❌ Resend API Mail Error:', mailError.message);
    }

    res.status(201).json({ success: true, message: 'Saved to database!', data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET Endpoint for registered users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));