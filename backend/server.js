const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Integrated Nodemailer
const User = require('./User'); // Points directly to our User.js file next to it

const app = express();
app.use(cors());
app.use(express.json());

// Connects to your MongoDB database
mongoose.connect('mongodb+srv://mohit31025_db_user:RKi4jcdzV0O8Sgfo@sarvshresthcc.jsmcfx5.mongodb.net/tutorPlatform?appName=SarvShresthCC')
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('❌ Database connection error:', err));

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Registration Endpoint with Automated Email Alert
app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();

    // Format subjects list clean display
    const subjectsList = Array.isArray(req.body.subjects) 
      ? req.body.subjects.join(', ') 
      : (req.body.subjects || 'N/A');

    // Build User-Friendly HTML Email
    const mailOptions = {
      from: `"Sarv Shreshth Portal" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sends directly to your coaching email address
      subject: `🚨 New ${req.body.role ? req.body.role.toUpperCase() : 'USER'} Registration: ${req.body.fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <h2 style="color: #ea580c; margin-top: 0;">🎓 New Registration Alert!</h2>
          <p style="font-size: 14px; color: #475569;">A new submission was just received on <strong>Sarv Shreshth Coaching Classes</strong>.</p>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Account Category:</td>
              <td style="padding: 8px 0; color: #0284c7; font-weight: bold; text-transform: uppercase;">${req.body.role || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Full Name:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.fullName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Class / Grade:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.classGrade || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Academic Stream:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.stream || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Selected Subjects:</td>
              <td style="padding: 8px 0; color: #0f172a;">${subjectsList}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Learning Mode:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.mode === 'home_tutor' ? '🏡 Home Tutor' : '🏫 Coaching Class'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Phone Number:</td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">
                <a href="https://wa.me/91${req.body.phone}" style="color: #16a34a; text-decoration: none;">+91 ${req.body.phone} (Click to WhatsApp)</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Email:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.email || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #334155;">Location / Address:</td>
              <td style="padding: 8px 0; color: #0f172a;">${req.body.locationOrAddress || 'N/A'}</td>
            </tr>
          </table>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Sarv Shreshth Automated Portal System</p>
        </div>
      `
    };

    // Trigger Email Notification (non-blocking)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error sending notification email:', error);
      } else {
        console.log('✉️ Notification email sent: ' + info.response);
      }
    });

    res.status(201).json({ success: true, message: 'Saved to database!', data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET all registered users
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