const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const University = require('../models/University');
const User = require('../models/User');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const auth = protect; // Alias for consistency across routes
const sendEmail = require('../utils/sendEmail');

const Otp = require('../models/Otp');

// Send OTPs for Registration (type: 'email' | 'phone' | 'both')
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone, type = 'both' } = req.body;

    if ((type === 'email' || type === 'both') && email) {
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.findOneAndUpdate(
        { identifier: email },
        { otp: emailOtp, createdAt: Date.now() },
        { upsert: true, new: true }
      );

      console.log(`[>> EMAIL OTP <<] Email: ${email} | OTP: ${emailOtp}`);

      // Dispatch the actual email (uses Ethereal test account by default in sendEmail.js)
      try {
        await sendEmail({
          email: email,
          subject: 'Verify Your University Registration',
          message: `Hello,\n\nYour 6-digit verification code is: ${emailOtp}\n\nThis OTP is valid for 10 minutes.\n\nThank you!`
        });
      } catch (err) {
        console.error("Failed to send OTP email:", err);
      }
    }

    if ((type === 'phone' || type === 'both') && phone) {
      const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();

      await Otp.findOneAndUpdate(
        { identifier: phone },
        { otp: phoneOtp, createdAt: Date.now() },
        { upsert: true, new: true }
      );

      console.log(`[>> PHONE OTP <<] Phone: ${phone} | OTP: ${phoneOtp}`);

      // Note: In a production environment, you would integrate Twilio, AWS SNS, 
      // or another SMS gateway here to send the SMS to the user's phone.
      // For testing, it will just be printed to the terminal above.
    }

    res.json({ message: 'OTP(s) sent. Check server terminal.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP — supports email-only, phone-only, or both
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, emailOtp, phone, phoneOtp } = req.body;

    // Verify email OTP if provided
    if (email && emailOtp) {
      const record = await Otp.findOne({ identifier: email });
      if (!record) return res.status(400).json({ message: 'No active OTP for this email. Please request a new one.' });
      if (record.otp !== emailOtp) return res.status(400).json({ message: 'Invalid Email OTP.' });

      await Otp.deleteOne({ identifier: email });
      // If only email was requested, return success
      if (!phone || !phoneOtp) return res.json({ message: 'Email verified successfully.' });
    }

    // Verify phone OTP if provided
    if (phone && phoneOtp) {
      const record = await Otp.findOne({ identifier: phone });
      if (!record) return res.status(400).json({ message: 'No active OTP for this phone. Please request a new one.' });
      if (record.otp !== phoneOtp) return res.status(400).json({ message: 'Invalid Phone OTP.' });

      await Otp.deleteOne({ identifier: phone });
    }

    res.json({ message: 'Verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handle University Application & Form Setup
router.post('/register', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'departments', maxCount: 10 },
  { name: 'labs', maxCount: 10 },
  { name: 'sports', maxCount: 10 },
  { name: 'auditorium', maxCount: 10 },
  { name: 'affiliationDocs', maxCount: 10 }
]), async (req, res) => {
  try {
    const { universityName, email, password, phone, country, state, address, plan, duration } = req.body;

    const existingObj = await University.findOne({ email });
    if (existingObj) {
      return res.status(400).json({ message: "University with this email already registered." });
    }

    const files = req.files || {};

    const uni = new University({
      name: universityName,
      email,
      phone,
      country,
      state,
      address,
      plan,
      duration,
      logoUrl: files.logo ? `/uploads/logo/${files.logo[0].filename}` : null,
      departmentImages: files.departments ? files.departments.map(f => `/uploads/departments/${f.filename}`) : [],
      labImages: files.labs ? files.labs.map(f => `/uploads/labs/${f.filename}`) : [],
      sportsImages: files.sports ? files.sports.map(f => `/uploads/sports/${f.filename}`) : [],
      auditoriumImages: files.auditorium ? files.auditorium.map(f => `/uploads/auditorium/${f.filename}`) : [],
      affiliationDocUrl: files.affiliationDocs ? `/uploads/affiliationDocs/${files.affiliationDocs[0].filename}` : null,
      affiliationDocBase64: req.body.affiliationDocBase64 || null
    });

    await uni.save();

    // Create the SUPER_ADMIN user immediately using the signup password
    // so the university can log in right away using their signup credentials.
    // Access is gated by uni.status (pending_verification → active after System Admin approval).
    // Password hashing is handled by User model pre-save hook.
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const adminUser = new User({
        university: uni._id,
        email,
        password,
        role: 'SUPER_ADMIN',
        name: universityName
      });
      await adminUser.save();
    }

    res.status(201).json({ message: 'Application Submitted successfully!', universityId: uni._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all pending universities (System Admin Use)
// DEV Note: Auth bypassed for testing the verification portal easily
router.get('/pending', async (req, res) => {
  try {
    const pendingUnis = await University.find({ status: 'pending_verification' }).sort({ createdAt: -1 });
    res.json(pendingUnis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all verified/active universities with their Super Admin user details
router.get('/verified', async (req, res) => {
  try {
    const activeUnis = await University.find({ status: 'active' }).sort({ updatedAt: -1 });
    // For each university, also fetch its super admin user
    const result = await Promise.all(activeUnis.map(async (uni) => {
      const admin = await User.findOne({ university: uni._id, role: 'SUPER_ADMIN' }).select('email name createdAt');
      return { ...uni.toObject(), adminUser: admin || null };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Single University by Name / Slug to display custom branding before login
router.get('/:name', async (req, res) => {
  try {
    const uni = await University.findOne({ name: req.params.name });
    if (!uni) return res.status(404).json({ message: 'Not found' });

    // Only return non-sensitive branding info
    res.json({
      name: uni.name,
      logoUrl: uni.logoUrl,
      plan: uni.plan,
      departmentImages: uni.departmentImages
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate and dispatch credentials
// DEV Note: Auth bypassed for testing the verification portal easily
router.put('/:id/validate', async (req, res) => {
  try {
    const uni = await University.findById(req.params.id);
    if (!uni) return res.status(404).json({ message: 'University not found' });

    if (uni.status === 'active') return res.status(400).json({ message: 'University is already active' });

    uni.status = 'active';

    // Generate Unique University ID: [Name Initial][State Initial] + 6 random digits
    // e.g., "Delhi University" in "Delhi" -> "DD847261"
    const nameInitial = uni.name.trim().charAt(0).toUpperCase();
    const stateInitial = uni.state ? uni.state.trim().charAt(0).toUpperCase() : 'X';
    const universityId = `${nameInitial}${stateInitial}${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate a login password: UN + 6 random alphanumeric chars
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let loginPassword = 'UN';
    for (let i = 0; i < 6; i++) loginPassword += chars.charAt(Math.floor(Math.random() * chars.length));

    // Store University ID and initial password on the university record for Admin view
    uni.generatedCredential = universityId;
    uni.generatedPassword = loginPassword;
    await uni.save();

    // Find or create the admin user and SET the new generated password
    let adminUser = await User.findOne({ email: uni.email, role: 'SUPER_ADMIN' });
    if (adminUser) {
      adminUser.password = loginPassword; // pre-save hook will hash
      await adminUser.save();
    } else {
      adminUser = new User({
        university: uni._id,
        email: uni.email,
        password: loginPassword,
        role: 'SUPER_ADMIN',
        name: uni.name
      });
      await adminUser.save();
    }

    // Dispatch Credentials via Email with Welcome Message
    const portalUrl = `http://localhost:5173/portal/${encodeURIComponent(uni.name)}`;
    const loginUrl = 'http://localhost:5173/university-login';

    const message = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎓 Welcome to IntelliQ!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello, ${uni.name}!

Congratulations! Your university has been successfully verified and approved on IntelliQ — the unified platform for managing your entire academic ecosystem.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR UNIVERSITY LOGIN CREDENTIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🆔  University ID  :  ${universityId}
  📧  Login Email    :  ${uni.email}
  🔑  Password       :  ${loginPassword}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR PORTAL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🌐  University Portal  :  ${portalUrl}
  🔐  Admin Login Page   :  ${loginUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅  Create and manage affiliated colleges
  ✅  Assign module-level permissions to each college
  ✅  Monitor university-wide analytics
  ✅  Change your password anytime after login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Important:
- Use the email and password above to sign in at the Admin Login Page.
- Your University ID (${universityId}) is your unique reference number.
- You can change your password after logging in for security.

Welcome aboard! 🚀
— The IntelliQ Team
`;

    await sendEmail({
      email: uni.email,
      subject: '🎓 Welcome to IntelliQ — Your University Credentials',
      message: message
    });

    console.log('============================================');
    console.log('🎓 UNIVERSITY CREDENTIALS DISPATCHED');
    console.log(`   University  : ${uni.name}`);
    console.log(`   Uni ID      : ${universityId}`);
    console.log(`   Email       : ${uni.email}`);
    console.log(`   Password    : ${loginPassword}`);
    console.log(`   Portal      : ${portalUrl}`);
    console.log('============================================');

    res.status(200).json({
      message: 'University verified! Credentials dispatched via email.',
      credentials: { universityId, email: uni.email, password: loginPassword, portalUrl }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update university details (Introduction, Address, Phone, Leadership) - FIXED
router.put('/:id/details', protect, async (req, res) => {
  try {
    const { introduction, address, phone, chancellor, viceChancellor } = req.body;
    const uni = await University.findById(req.params.id);
    if (!uni) return res.status(404).json({ message: 'University not found' });

    // Only SUPER_ADMIN can update their own university
    if (req.user.role !== 'SUPER_ADMIN' || req.user.university.toString() !== uni._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update these details' });
    }

    if (introduction !== undefined) uni.introduction = introduction;
    if (address !== undefined) uni.address = address;
    if (phone !== undefined) uni.phone = phone;

    if (chancellor) {
      uni.chancellor = { ...uni.chancellor, ...chancellor };
    }
    if (viceChancellor) {
      uni.viceChancellor = { ...uni.viceChancellor, ...viceChancellor };
    }

    await uni.save();
    res.json(uni);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
