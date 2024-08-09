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
app.use(bodyParser.urlencoded({ extended: true }));

// บันทึก userId ในฐานข้อมูล
app.post('/saveUserId', (req, res) => {
  const userId = req.body.userId;
  const checkSql = 'SELECT * FROM users WHERE user_id = ?';
  db.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error('Error checking user ID:', err);
      return res.status(500).send('Server error');
    }
    if (results.length > 0) {
      res.send('User ID already exists');
    } else {
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

// ดึงข้อมูลจากตาราง recipes
app.get('/recipes', (req, res) => {
  const sql = 'SELECT * FROM recipes';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting recipes:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// ดึงข้อมูลจากตาราง categories
app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting categories:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// ดึงข้อมูลจากตาราง ingredients
app.get('/ingredients', (req, res) => {
  const sql = 'SELECT * FROM ingredients';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting ingredients:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.get('/categories', (req, res, next) => {
  connection.query('SELECT DISTINCT ingredient_type FROM ingredients', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const categories = results.map(result => result.ingredient_category);
    res.json(categories);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
