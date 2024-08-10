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
  const category = req.query.category_id; // รับค่าพารามิเตอร์ category_id จาก query string

  let sql = 'SELECT * FROM recipes';
  const params = [];

  if (category) {
    sql += ' WHERE category_id = ?'; // กรองตาม category_id หรือปรับเป็นชื่อคอลัมน์ที่ใช้จริง
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this category' });
    }

    res.json(results); // ส่งข้อมูลเมนูที่ถูกกรองกลับไปยัง client
  });
});

// ดึงข้อมูลจากตาราง recipe_ingredients โดยใช้ recipe_id
app.get('/recipe_ingredients', (req, res) => {
  const recipeId = req.query.recipe_id; // รับค่าพารามิเตอร์ recipe_id จาก query string

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  const sql = `
    SELECT ri.ingredient_id, i.ingredient_name 
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    WHERE ri.recipe_id = ?`;
  
  db.query(sql, [recipeId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
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

app.get('/user_ingredients', (req, res) => {
  const userId = req.query.userId; // สมมติว่า userId คาดหวังว่ามาจาก query parameters

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sql = 'SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }

    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
