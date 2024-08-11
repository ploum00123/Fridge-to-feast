const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // ใช้ mysql2/promise สำหรับ Promise
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// สร้าง connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fridge_to_feast',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Route to save userId
app.post('/saveUserId', async (req, res) => {
  const userId = req.body.userId;
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (results.length > 0) {
      res.send('User ID already exists');
    } else {
      await pool.query('INSERT INTO users (user_id) VALUES (?)', [userId]);
      res.send('User ID saved');
    }
  } catch (err) {
    console.error('Error checking user ID:', err);
    res.status(500).send('Server error');
  }
});

// Route to fetch recipes
app.get('/recipes', async (req, res) => {
  const category = req.query.category_id; 
  let sql = 'SELECT * FROM recipes';
  const params = [];

  if (category) {
    sql += ' WHERE category_id = ?'; 
    params.push(category);
  }

  try {
    const [results] = await pool.query(sql, params);
    if (results.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this category' });
    }
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Route to fetch recipe ingredients by recipe_id
app.get('/recipe_ingredients', async (req, res) => {
  const recipeId = req.query.recipe_id; 

  if (!recipeId) {
    return res.status(400).json({ error: 'Recipe ID is required' });
  }

  const sql = `
    SELECT ri.ingredient_id, i.ingredient_name 
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
    WHERE ri.recipe_id = ?`;
  
  try {
    const [results] = await pool.query(sql, [recipeId]);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// Route to fetch all categories
app.get('/categories', async (req, res) => {
  const sql = 'SELECT * FROM categories';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error getting categories:', err);
    return res.status(500).send('Server error');
  }
});

// Route to fetch all ingredients
app.get('/ingredients', async (req, res) => {
  const sql = 'SELECT * FROM ingredients';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error getting ingredients:', err);
    return res.status(500).send('Server error');
  }
});

// Route to fetch user ingredients by user_id
app.get('/user_ingredients', async (req, res) => {
  const userId = req.query.userId; 

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const sql = 'SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?';
  try {
    const [results] = await pool.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Database query failed' });
  }
});

// ดึงข้อมูล ingredients ที่ตรงกับ category_name ของ ingredient_categories
app.get('/ingredients_by_category', async (req, res) => {
  const category_name = req.query.category_name;

  if (!category_name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const sql = `
    SELECT i.* 
    FROM ingredients i
    JOIN ingredient_categories ic ON i.ingredient_type = ic.category_name
    WHERE ic.category_name = ?`;

  try {
    const [results] = await pool.query(sql, [category_name]);
    res.json(results);
  } catch (err) {
    console.error('Error getting ingredients by category:', err);
    return res.status(500).send('Server error');
  }
});

// Route to fetch all ingredient_categories
app.get('/ingredient_categories', async (req, res) => {
  const sql = 'SELECT * FROM ingredient_categories';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error getting ingredient categories:', err);
    return res.status(500).send('Server error');
  }
});

// Route to add ingredient to user's refrigerator
app.post('/add_ingredient', async (req, res) => {
  const { user_id, ingredient_id } = req.body;

  if (!user_id || !ingredient_id) {
    return res.status(400).json({ error: 'User ID and Ingredient ID are required' });
  }

  const sql = 'INSERT INTO user_refrigerator (user_id, ingredient_id, added_date) VALUES (?, ?, NOW())';
  try {
    const [result] = await pool.query(sql, [user_id, ingredient_id]);
    res.json({ message: 'Ingredient added successfully', id: result.insertId });
  } catch (err) {
    console.error('Error adding ingredient to user refrigerator:', err);
    return res.status(500).json({ error: 'Failed to add ingredient' });
  }
});

// Route to get user's ingredients
app.get('/user_ingredients/:user_id', async (req, res) => {
  const user_id = req.params.user_id;

  const sql = `
    SELECT i.* 
    FROM ingredients i
    JOIN user_refrigerator ur ON i.ingredient_id = ur.ingredient_id
    WHERE ur.user_id = ?`;

  try {
    const [results] = await pool.query(sql, [user_id]);
    res.json(results);
  } catch (err) {
    console.error('Error getting user ingredients:', err);
    return res.status(500).json({ error: 'Failed to get user ingredients' });
  }
});

app.delete('/delete_ingredient', async (req, res) => {
  const { user_id, ingredient_id } = req.body;

  if (!user_id || !ingredient_id) {
    return res.status(400).json({ error: 'User ID and Ingredient ID are required' });
  }

  const sql = 'DELETE FROM user_refrigerator WHERE user_id = ? AND ingredient_id = ?';
  try {
    const [result] = await pool.query(sql, [user_id, ingredient_id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingredient not found in user\'s refrigerator' });
    }
    
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (err) {
    console.error('Error deleting ingredient from user refrigerator:', err);
    return res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

// Route to fetch all cook methods
app.get('/cook_methods', async (req, res) => {
  const sql = 'SELECT * FROM cookmethod_category';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error getting cooking methods:', err);
    return res.status(500).send('Server error');
  }
});

app.post('/add_user_cookmethod', async (req, res) => {
  const { user_id, cooking_method_id, preference_level } = req.body;

  if (!user_id || !cooking_method_id || preference_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // First, check if the record already exists
    const [checkResult] = await pool.query('SELECT * FROM user_cookmethod WHERE user_id = ? AND cooking_method_id = ?', [user_id, cooking_method_id]);

    let sql, params, successMessage;

    if (checkResult.length > 0) {
      // Update existing record
      sql = 'UPDATE user_cookmethod SET preference_level = ? WHERE user_id = ? AND cooking_method_id = ?';
      params = [preference_level, user_id, cooking_method_id];
      successMessage = 'User cook method updated successfully';
    } else {
      // Insert new record
      sql = 'INSERT INTO user_cookmethod (user_id, cooking_method_id, preference_level) VALUES (?, ?, ?)';
      params = [user_id, cooking_method_id, preference_level];
      successMessage = 'User cook method added successfully';
    }

    const [result] = await pool.query(sql, params);
    
    res.json({ 
      message: successMessage, 
      id: result.insertId || (checkResult[0] && checkResult[0].id) || null 
    });
  } catch (err) {
    console.error('Error adding/updating user cook method:', err);
    res.status(500).json({ error: 'Failed to add/update user cook method', details: err.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Fetching recipes for user:', userId);

    // Fetch user's ingredients
    const [userIngredients] = await pool.query('SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?', [userId]);
    const userIngredientIds = userIngredients.map(row => row.ingredient_id);

    // Fetch user's cooking methods
    const [userCookMethods] = await pool.query('SELECT cooking_method_id FROM user_cookmethod WHERE user_id = ?', [userId]);
    const userCookMethodIds = userCookMethods.map(row => row.cooking_method_id);

    if (userIngredientIds.length === 0 || userCookMethodIds.length === 0) {
      console.log('No user ingredients or cooking methods found');
      return res.json([]);
    }

    // Fetch recipes
    const [recipes] = await pool.query(`
      SELECT 
        r.recipe_id, 
        r.recipe_name, 
        r.cooking_method_id,
        r.image_path,
        GROUP_CONCAT(DISTINCT i.ingredient_name) AS required_ingredients,
        (SELECT COUNT(*) 
         FROM recipe_ingredients ri2 
         JOIN ingredients i2 ON ri2.ingredient_id = i2.ingredient_id
         WHERE ri2.recipe_id = r.recipe_id AND ri2.ingredient_id IN (?) AND ri2.is_essential = TRUE) 
         AS matched_essential_ingredients_count,
        (SELECT COUNT(*) 
         FROM recipe_ingredients ri3
         WHERE ri3.recipe_id = r.recipe_id AND ri3.is_essential = TRUE) 
         AS total_essential_ingredients,
        (SELECT GROUP_CONCAT(i2.ingredient_name) 
         FROM recipe_ingredients ri4
         JOIN ingredients i2 ON ri4.ingredient_id = i2.ingredient_id
         WHERE ri4.recipe_id = r.recipe_id AND ri4.is_essential = TRUE) 
         AS essential_ingredients,
        (SELECT GROUP_CONCAT(i3.ingredient_name)
         FROM recipe_ingredients ri5
         JOIN ingredients i3 ON ri5.ingredient_id = i3.ingredient_id
         WHERE ri5.recipe_id = r.recipe_id AND ri5.is_essential = TRUE AND ri5.ingredient_id NOT IN (?))
         AS missing_essential_ingredients
      FROM recipes r
      JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
      JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
      WHERE r.cooking_method_id IN (?)
      GROUP BY r.recipe_id, r.recipe_name, r.cooking_method_id, r.image_path
    `, [userIngredientIds, userIngredientIds, userCookMethodIds]);

    // Process recipes
    const processedRecipes = recipes.map(recipe => {
      const essentialIngredients = recipe.essential_ingredients ? recipe.essential_ingredients.split(',') : [];
      const missingEssentialIngredients = recipe.missing_essential_ingredients ? recipe.missing_essential_ingredients.split(',') : [];
      return {
        ...recipe,
        essentialIngredients,
        missing_essential_ingredients: missingEssentialIngredients,
        missing_essential_ingredients_count: missingEssentialIngredients.length
      };
    });

    // Sort recipes
    processedRecipes.sort((a, b) => {
      const aIsExactMatch = a.matched_essential_ingredients_count === a.total_essential_ingredients && userCookMethodIds.includes(a.cooking_method_id);
      const bIsExactMatch = b.matched_essential_ingredients_count === b.total_essential_ingredients && userCookMethodIds.includes(b.cooking_method_id);
      if (aIsExactMatch && !bIsExactMatch) return -1;
      if (!aIsExactMatch && bIsExactMatch) return 1;
      return b.matched_essential_ingredients_count - a.matched_essential_ingredients_count;
    });

    console.log('Sending processed recipes:', processedRecipes);
    res.json(processedRecipes);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/user_cookmethods/:user_id', async (req, res) => {
  const userId = req.params.user_id;
  const sql = 'SELECT cooking_method_id FROM user_cookmethod WHERE user_id = ?';
  try {
    const [results] = await pool.query(sql, [userId]);
    res.json(results);
  } catch (err) {
    console.error('Error getting user cooking methods:', err);
    return res.status(500).json({ error: 'Failed to get user cooking methods' });
  }
});

app.get('/cook_methods', async (req, res) => {
  const sql = 'SELECT * FROM cookmethod_category';
  try {
    const [results] = await pool.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error getting cooking methods:', err);
    return res.status(500).send('Server error');
  }
});

app.get('/user_data/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (users.length > 0) {
      res.json(users[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/create_user', async (req, res) => {
  const { user_id } = req.body;
  try {
    // ตรวจสอบว่ามีผู้ใช้อยู่แล้วหรือไม่
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
    
    if (existingUsers.length > 0) {
      // ถ้ามีผู้ใช้อยู่แล้ว ส่งข้อมูลผู้ใช้กลับไป
      console.log('User already exists:', existingUsers[0]);
      res.status(200).json({ message: 'User already exists', user: existingUsers[0] });
    } else {
      // ถ้ายังไม่มีผู้ใช้ สร้างผู้ใช้ใหม่
      await pool.query('INSERT INTO users (user_id) VALUES (?)', [user_id]);
      console.log('New user created:', user_id);
      res.status(201).json({ message: 'User created successfully', user_id: user_id });
    }
  } catch (error) {
    console.error('Error handling user creation:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      // ถ้าเกิด duplicate entry error ให้ดึงข้อมูลผู้ใช้ที่มีอยู่แล้วและส่งกลับ
      const [existingUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
      if (existingUser.length > 0) {
        console.log('Duplicate entry handled, returning existing user:', existingUser[0]);
        res.status(200).json({ message: 'User already exists', user: existingUser[0] });
      } else {
        res.status(500).json({ error: 'Unexpected error occurred' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.get('/recipe_details', async (req, res) => {
  try {
    const recipeId = req.query.recipe_id;
    const userId = req.query.user_id;

    if (!recipeId || !userId) {
      return res.status(400).json({ error: 'Recipe ID and User ID are required' });
    }

    // Fetch recipe details
    const recipeQuery = `
      SELECT 
        r.recipe_id, 
        r.recipe_name, 
        r.cooking_method_id,
        r.image_path,
        r.category_id,
        cc.cooking_method_name,
        GROUP_CONCAT(DISTINCT i.ingredient_name) AS required_ingredients,
        COUNT(DISTINCT CASE WHEN ri.ingredient_id IN (SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?) AND ri.is_essential = TRUE THEN ri.ingredient_id END) AS matched_essential_ingredients_count,
        COUNT(DISTINCT CASE WHEN ri.is_essential = TRUE THEN ri.ingredient_id END) AS total_essential_ingredients,
        GROUP_CONCAT(DISTINCT CASE WHEN ri.is_essential = TRUE AND ri.ingredient_id NOT IN (SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?) THEN i.ingredient_name END) AS missing_essential_ingredients
      FROM recipes r
      JOIN recipe_ingredients ri ON r.recipe_id = ri.recipe_id
      JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
      JOIN cookmethod_category cc ON r.cooking_method_id = cc.cooking_method_id
      WHERE r.recipe_id = ?
      GROUP BY r.recipe_id, r.recipe_name, r.cooking_method_id, r.image_path, r.category_id, cc.cooking_method_name
    `;

    // เปลี่ยนจาก db.query เป็น pool.query
    const [recipeDetails] = await pool.query(recipeQuery, [userId, userId, recipeId]);

    if (recipeDetails.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Process recipe details
    const processedDetails = {
      ...recipeDetails[0],
      required_ingredients: recipeDetails[0].required_ingredients.split(','),
      missing_essential_ingredients: recipeDetails[0].missing_essential_ingredients ? recipeDetails[0].missing_essential_ingredients.split(',') : []
    };

    res.json(processedDetails);
  } catch (err) {
    console.error('Error fetching recipe details:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.get('/ingredient_history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const query = `
      SELECT ur.user_refrigerator_id, i.ingredient_name, ur.added_date, i.ingredient_image
      FROM user_refrigerator ur
      JOIN ingredients i ON ur.ingredient_id = i.ingredient_id
      WHERE ur.user_id = ?
      ORDER BY ur.added_date DESC
      LIMIT 10
    `;
    
    const [results] = await pool.query(query, [userId]);
    
    res.json(results);
  } catch (err) {
    console.error('Error fetching ingredient history:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.put('/update_user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const updatedData = req.body;
  try {
    const query = 'UPDATE users SET ? WHERE user_id = ?';
    await pool.query(query, [updatedData, userId]);
    res.json({ message: 'User data updated successfully' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
