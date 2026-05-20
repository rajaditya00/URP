const mongoose = require('mongoose');
const User = require('./models/User');
const College = require('./models/College');
const jwt = require('jsonwebtoken');

async function test() {
  await mongoose.connect('mongodb+srv://rajadityaaddy00_db_user:etNUcx3guScA6JSR@cluster0.c1niipl.mongodb.net/campuscore');
  
  // Find a super admin
  const superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!superAdmin) {
    console.log("No super admin found");
    process.exit(0);
  }

  const token = jwt.sign({ user: { id: superAdmin._id } }, 'supersecretcampuscorekey');
  
  const payload = {
    name: "Test College API",
    email: "testcolapi1@example.com",
    address: "123 Test St",
    phone: "1234567890",
    principalName: "Dr. API Test"
  };

  const response = await fetch('http://localhost:5000/api/college', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Response:", data);
  process.exit(0);
}

test().catch(console.error);
