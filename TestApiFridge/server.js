const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Added for CORS

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Route to save userId
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

// Route to fetch recipes
app.get('/recipes', (req, res) => {
  const category = req.query.category_id; 

  let sql = 'SELECT * FROM recipes';
  const params = [];

  if (category) {
    sql += ' WHERE category_id = ?'; 
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

    res.json(results);
  });
});

// Route to fetch recipe ingredients by recipe_id
app.get('/recipe_ingredients', (req, res) => {
  const recipeId = req.query.recipe_id; 

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

// Route to fetch all categories
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

// Route to fetch all ingredients
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

// Route to fetch user ingredients by user_id
app.get('/user_ingredients', (req, res) => {
  const userId = req.query.userId; 

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

// ดึงข้อมูล ingredients ที่ตรงกับ category_name ของ ingredient_categories
app.get('/ingredients_by_category', (req, res) => {
  const category_name = req.query.category_name;

  if (!category_name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const sql = `
    SELECT i.* 
    FROM ingredients i
    JOIN ingredient_categories ic ON i.ingredient_type = ic.category_name
    WHERE ic.category_name = ?`;

  db.query(sql, [category_name], (err, results) => {
    if (err) {
      console.error('Error getting ingredients by category:', err);
      return res.status(500).send('Server error');
    }

    res.json(results);
  });
});

// Route to fetch all ingredient_categories
app.get('/ingredient_categories', (req, res) => {
  const sql = 'SELECT * FROM ingredient_categories';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting ingredient categories:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// Route to add ingredient to user's refrigerator
app.post('/add_ingredient', (req, res) => {
  const { user_id, ingredient_id } = req.body;

  if (!user_id || !ingredient_id) {
    return res.status(400).json({ error: 'User ID and Ingredient ID are required' });
  }

  const sql = 'INSERT INTO user_refrigerator (user_id, ingredient_id, added_date) VALUES (?, ?, NOW())';
  db.query(sql, [user_id, ingredient_id], (err, result) => {
    if (err) {
      console.error('Error adding ingredient to user refrigerator:', err);
      return res.status(500).json({ error: 'Failed to add ingredient' });
    }
    res.json({ message: 'Ingredient added successfully', id: result.insertId });
  });
});

// Route to get user's ingredients
app.get('/user_ingredients/:user_id', (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT i.* 
    FROM ingredients i
    JOIN user_refrigerator ur ON i.ingredient_id = ur.ingredient_id
    WHERE ur.user_id = ?`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('Error getting user ingredients:', err);
      return res.status(500).json({ error: 'Failed to get user ingredients' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
