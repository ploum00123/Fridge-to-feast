const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Added for CORS
const util = require('util');

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

db.query = util.promisify(db.query);

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

app.delete('/delete_ingredient', (req, res) => {
  const { user_id, ingredient_id } = req.body;

  if (!user_id || !ingredient_id) {
    return res.status(400).json({ error: 'User ID and Ingredient ID are required' });
  }

  const sql = 'DELETE FROM user_refrigerator WHERE user_id = ? AND ingredient_id = ?';
  db.query(sql, [user_id, ingredient_id], (err, result) => {
    if (err) {
      console.error('Error deleting ingredient from user refrigerator:', err);
      return res.status(500).json({ error: 'Failed to delete ingredient' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ingredient not found in user\'s refrigerator' });
    }
    
    res.json({ message: 'Ingredient deleted successfully' });
  });
});

// Route to fetch all cook methods
app.get('/cook_methods', (req, res) => {
  const sql = 'SELECT * FROM cookmethod_category';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting cooking methods:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

app.post('/add_user_cookmethod', async (req, res) => {
  const { user_id, cooking_method_id, preference_level } = req.body;

  if (!user_id || !cooking_method_id || preference_level === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // First, check if the record already exists
    const checkResult = await db.query('SELECT * FROM user_cookmethod WHERE user_id = ? AND cooking_method_id = ?', [user_id, cooking_method_id]);

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

    const result = await db.query(sql, params);
    
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
    const userIngredients = await db.query('SELECT ingredient_id FROM user_refrigerator WHERE user_id = ?', [userId]);
    const userIngredientIds = userIngredients.map(row => row.ingredient_id);

    // Fetch user's cooking methods
    const userCookMethods = await db.query('SELECT cooking_method_id FROM user_cookmethod WHERE user_id = ?', [userId]);
    const userCookMethodIds = userCookMethods.map(row => row.cooking_method_id);

    if (userIngredientIds.length === 0 || userCookMethodIds.length === 0) {
      console.log('No user ingredients or cooking methods found');
      return res.json([]);
    }

    // Fetch recipes
    const recipes = await db.query(`
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

app.get('/user_cookmethods/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const sql = 'SELECT cooking_method_id FROM user_cookmethod WHERE user_id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error getting user cooking methods:', err);
      return res.status(500).json({ error: 'Failed to get user cooking methods' });
    }
    res.json(results);
  });
});

app.get('/cook_methods', (req, res) => {
  const sql = 'SELECT * FROM cookmethod_category';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error getting cooking methods:', err);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

// เพิ่ม endpoint นี้ในไฟล์ server.js ของคุณ

app.get('/api/test/recipes', (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // จำลองข้อมูลวัตถุดิบของผู้ใช้
  const mockUserIngredients = [
    { ingredient_id: 1 },
    { ingredient_id: 2 },
    { ingredient_id: 3 }
  ];

  // จำลองข้อมูลวิธีการทำอาหารที่ผู้ใช้ชอบ
  const mockUserCookMethods = [
    { cooking_method_id: 1 },
    { cooking_method_id: 2 }
  ];

  // จำลองข้อมูลสูตรอาหาร
  const mockRecipes = [
    {
      recipe_id: 1,
      recipe_name: 'สปาเก็ตตี้ซอสมะเขือเทศ',
      cooking_method_id: 1,
      image_path: 'http://example.com/spaghetti.jpg',
      required_ingredients: 'เส้นสปาเก็ตตี้,มะเขือเทศ,กระเทียม',
      matched_ingredients_count: 2,
      total_ingredients: 3
    },
    {
      recipe_id: 2,
      recipe_name: 'สลัดผัก',
      cooking_method_id: 2,
      image_path: 'http://example.com/salad.jpg',
      required_ingredients: 'ผักสลัด,มะเขือเทศ,แตงกวา,น้ำสลัด',
      matched_ingredients_count: 1,
      total_ingredients: 4
    },
    {
      recipe_id: 3,
      recipe_name: 'ข้าวผัดไข่',
      cooking_method_id: 1,
      image_path: 'http://example.com/fried-rice.jpg',
      required_ingredients: 'ข้าว,ไข่,ต้นหอม',
      matched_ingredients_count: 3,
      total_ingredients: 3
    }
  ];

  // เพิ่มข้อมูลวัตถุดิบที่ขาดและจำนวนที่ขาด
  mockRecipes.forEach(recipe => {
    const requiredIngredients = recipe.required_ingredients.split(',');
    const missingIngredients = requiredIngredients.filter(ingredient => 
      !mockUserIngredients.some(userIngredient => userIngredient.ingredient_id === requiredIngredients.indexOf(ingredient) + 1)
    );
    recipe.missing_ingredients = missingIngredients;
    recipe.missing_ingredients_count = missingIngredients.length;
  });

  // เรียงลำดับสูตรอาหารตามเกณฑ์
  mockRecipes.sort((a, b) => {
    // 1. นำเมนูที่ตรงกับวัตถุดิบและวิธีการทำทั้งหมดขึ้นก่อน
    const aIsExactMatch = a.matched_ingredients_count === a.total_ingredients;
    const bIsExactMatch = b.matched_ingredients_count === b.total_ingredients;
    if (aIsExactMatch && !bIsExactMatch) return -1;
    if (!aIsExactMatch && bIsExactMatch) return 1;

    // 2. เรียงตามจำนวนวัตถุดิบที่ตรงกัน โดยมากไปน้อย
    return b.matched_ingredients_count - a.matched_ingredients_count;
  });

  res.json(mockRecipes);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
