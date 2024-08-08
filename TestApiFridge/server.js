require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const mysql = require('mysql2');

const app = express();
app.use(bodyParser.json());

// ตั้งค่า Clerk
const clerkClient = createClerkClient({
  apiKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
});

// ตั้งค่า MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fridge_to_feast'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// ฟังก์ชันเพื่อบันทึก `user_id` ลงใน MySQL
const saveUserId = (userId, res) => {
  const query = 'INSERT INTO users (user_id) VALUES (?)';
  console.log('Saving User ID:', userId); // ตรวจสอบค่า userId ก่อนบันทึก
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error saving user ID:', err);
      res.status(500).json({ error: 'Error saving user ID' });
      return;
    }
    console.log('User ID saved:', results.insertId);
    res.status(200).json({ message: 'User ID saved' });
  });
};

// ฟังก์ชันเพื่อดึง `user_id` เมื่อผู้ใช้ล็อกอินด้วย Google
const handleGoogleLogin = async (token, res) => {
  try {
    const user = await clerkClient.users.getUser(token);
    const userId = user.id;
    console.log('Google user ID:', userId);
    saveUserId(userId, res);
  } catch (err) {
    console.error('Error fetching user ID:', err);
    res.status(500).json({ error: 'Error fetching user ID' });
  }
};

// Endpoint สำหรับรับ token จาก frontend
app.post('/api/save-user', (req, res) => {
  const { userId } = req.body;
  console.log('Received User ID:', userId); // ตรวจสอบค่าที่ได้รับจาก frontend
  if (!userId) {
    res.status(400).json({ error: 'User ID is required' });
    return;
  }
  saveUserId(userId, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
