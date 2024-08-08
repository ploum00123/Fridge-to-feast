const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fridge_to_feast'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to database');
});

app.use(bodyParser.json());

app.post('/saveUserId', (req, res) => {
  const userId = req.body.userId;
  const checkSql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user ID:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      // User ID already exists
      res.send('User ID already exists');
    } else {
      // User ID does not exist, insert it
      const insertSql = 'INSERT INTO users (user_id) VALUES (?)';
      db.query(insertSql, [userId], (err, result) => {
        if (err) {
          console.error('Error inserting user ID:', err);
          return res.status(500).send('Server error');
        }
        res.send('User ID saved');
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
