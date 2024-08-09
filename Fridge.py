import pandas as pd
import mysql.connector
import re

# Connect to MySQL database
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="fridge_to_feast"
)

mycursor = mydb.cursor()

# Create tables if they don't exist
def create_tables():
    tables = {
        'categories': '''
            CREATE TABLE IF NOT EXISTS categories (
                category_id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(255),
                category_image VARCHAR(255)
            )
        ''',
        'recipes': '''
            CREATE TABLE IF NOT EXISTS recipes (
                recipe_id INT AUTO_INCREMENT PRIMARY KEY,
                recipe_name VARCHAR(255),
                cooking_method VARCHAR(255),
                instructions TEXT,
                image_path VARCHAR(255),
                category_id INT,
                FOREIGN KEY(category_id) REFERENCES categories(category_id)
            )
        ''',
        'ingredients': '''
            CREATE TABLE IF NOT EXISTS ingredients (
                ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
                ingredient_name VARCHAR(255),
                ingredient_type VARCHAR(255),
                ingredient_image VARCHAR(255)
            )
        ''',
        'recipe_ingredients': '''
            CREATE TABLE IF NOT EXISTS recipe_ingredients (
                recipe_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
                recipe_id INT,
                ingredient_id INT,
                quantity VARCHAR(255),
                is_essential BOOLEAN,
                is_main BOOLEAN,
                FOREIGN KEY(recipe_id) REFERENCES recipes(recipe_id),
                FOREIGN KEY(ingredient_id) REFERENCES ingredients(ingredient_id)
            )
        ''',
        'dietary_restrictions': '''
            CREATE TABLE IF NOT EXISTS dietary_restrictions (
                restriction_id INT AUTO_INCREMENT PRIMARY KEY,
                restriction_name VARCHAR(255)
            )
        ''',
        'recipe_restrictions': '''
            CREATE TABLE IF NOT EXISTS recipe_restrictions (
                recipe_id INT,
                restriction_id INT,
                FOREIGN KEY(recipe_id) REFERENCES recipes(recipe_id),
                FOREIGN KEY(restriction_id) REFERENCES dietary_restrictions(restriction_id)
            )
        ''',
        'users': '''
            CREATE TABLE IF NOT EXISTS users (
                user_id VARCHAR(255) PRIMARY KEY,
                country VARCHAR(255),
                province VARCHAR(255),
                district VARCHAR(255),
                sub_district VARCHAR(255),
                village VARCHAR(255),
                house_number VARCHAR(255),
                postal_code VARCHAR(10)
            )
        ''',
        'user_refrigerator': '''
            CREATE TABLE IF NOT EXISTS user_refrigerator (
                user_id VARCHAR(255),
                ingredient_id INT,
                quantity TEXT,
                added_date DATE,
                FOREIGN KEY(user_id) REFERENCES users(user_id),
                FOREIGN KEY(ingredient_id) REFERENCES ingredients(ingredient_id)
            )
        ''',
        'user_preferences': '''
            CREATE TABLE IF NOT EXISTS user_preferences (
                user_id VARCHAR(255),
                preference_type TEXT,
                value TEXT,
                is_liked BOOLEAN,
                FOREIGN KEY(user_id) REFERENCES users(user_id)
            )
        '''
    }
    for table_name, create_query in tables.items():
        mycursor.execute(create_query)

create_tables()

# เพิ่มคอลัมน์ category_image และ ingredient_image ถ้ายังไม่มีอยู่ในตาราง
def add_category_image_column(cursor):
    cursor.execute("""
        ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS category_image VARCHAR(255)
    """)
    cursor.execute("""
        ALTER TABLE ingredients
        ADD COLUMN IF NOT EXISTS ingredient_image VARCHAR(255)
    """)
    mydb.commit()

# เรียกใช้ฟังก์ชันเพื่อเพิ่มคอลัมน์
with mydb.cursor() as cursor:
    add_category_image_column(cursor)

# ฟังก์ชันเพื่อดึงหรือเพิ่มข้อมูลและคืนค่า ID
def get_or_create_id(table_name, id_column_name, column_name, value, cursor, db):
    cursor.execute(f"SELECT {id_column_name} FROM {table_name} WHERE {column_name} = %s", (value,))
    result = cursor.fetchone()
    cursor.fetchall()  # Clear any unread results
    if result:
        return result[0]
    else:
        cursor.execute(f"INSERT INTO {table_name} ({column_name}) VALUES (%s) ON DUPLICATE KEY UPDATE {column_name}=VALUES({column_name})", (value,))
        db.commit()
        cursor.execute("SELECT LAST_INSERT_ID()")
        result = cursor.fetchone()
        cursor.fetchall()  # Clear any unread results
        return result[0]

# แก้ไขฟังก์ชัน get_or_create_id สำหรับ ingredients เพื่อจัดการกับ ingredient_type และ ingredient_image
def get_or_create_ingredient_id(ingredient_name, ingredient_type, cursor, db):
    cursor.execute("SELECT ingredient_id FROM ingredients WHERE ingredient_name = %s", (ingredient_name,))
    result = cursor.fetchone()
    cursor.fetchall()  # Clear any unread results
    if result:
        return result[0]
    else:
        cursor.execute("""
            INSERT INTO ingredients (ingredient_name, ingredient_type) 
            VALUES (%s, %s) 
            ON DUPLICATE KEY UPDATE 
            ingredient_name=VALUES(ingredient_name), 
            ingredient_type=VALUES(ingredient_type)
        """, (ingredient_name, ingredient_type))
        db.commit()
        cursor.execute("SELECT LAST_INSERT_ID()")
        result = cursor.fetchone()
        cursor.fetchall()  # Clear any unread results
        return result[0]

# อ่านข้อมูลจาก Excel sheet
file_paths = {
    "menu": r'D:\database-excel\Menu.xlsx',
    "ingredients": r'D:\database-excel\Ingredients.xlsx',
    "categories": r'D:\database-excel\Categories.xlsx',
    "restrictions": r'D:\database-excel\Restrictions.xlsx'
}

dataframes = {}
for key, path in file_paths.items():
    dataframes[key] = pd.read_excel(path)
    print(f"Columns in {key}:", dataframes[key].columns)

df_recipes = dataframes["menu"]
df_ingredients = dataframes["ingredients"]
df_categories = dataframes["categories"]
df_restrictions = dataframes["restrictions"]

# สร้าง sets เพื่อเก็บข้อมูล ingredients, categories, และ restrictions
all_ingredients = set()
all_categories = set()
all_restrictions = set()

# วนลูปและเพิ่มข้อมูลลงใน sets
for _, row in df_recipes.iterrows():
    if not pd.isna(row['main_ingredients']):
        all_ingredients.update([item.strip().split(':')[0] for item in row['main_ingredients'].split(',')])
    if not pd.isna(row['other_ingredients']):
        all_ingredients.update([item.strip().split(':')[0] for item in row['other_ingredients'].split(',')])
    if not pd.isna(row['seasonings']):
        all_ingredients.update([item.strip().split(':')[0] for item in row['seasonings'].split(',')])
    if not pd.isna(row['category_name']):
        all_categories.add(row['category_name'])
    if not pd.isna(row['restriction_name']):
        all_restrictions.add(row['restriction_name'])

# Print the sets to check the extracted data
print("All ingredients:", all_ingredients)
print("All categories:", all_categories)
print("All restrictions:", all_restrictions)

# Insert ข้อมูลจาก sets ลงในตารางที่เกี่ยวข้อง
with mydb.cursor() as cursor:
    for index, row in df_ingredients.iterrows():
        ingredient_name = row['ingredient_name']
        ingredient_type = row['ingredient_type']
        ingredient_image = row.get('ingredient_image') if 'ingredient_image' in df_ingredients.columns else None

        ingredient_id = get_or_create_ingredient_id(ingredient_name, ingredient_type, cursor, mydb)
        
        # Update the ingredient_image if available
        if ingredient_image:
            cursor.execute("UPDATE ingredients SET ingredient_image = %s WHERE ingredient_id = %s", 
                           (ingredient_image, ingredient_id))
    mydb.commit()

    for item in all_categories:
        get_or_create_id('categories', 'category_id', 'category_name', item, cursor, mydb)
    mydb.commit()
    
    for item in all_restrictions:
        get_or_create_id('dietary_restrictions', 'restriction_id', 'restriction_name', item, cursor, mydb)
    mydb.commit()

# ฟังก์ชันเพื่อ insert วัตถุดิบและเครื่องปรุง
def insert_recipe_ingredients(ingredient_column, is_essential, is_main, row, recipe_id, cursor):
    if not pd.isna(row[ingredient_column]):
        for ingredient_data in row[ingredient_column].split(','):
            parts = [item.strip() for item in ingredient_data.split(':')]
            if len(parts) == 2:
                ingredient_name, quantity = parts
                ingredient_id = get_or_create_id('ingredients', 'ingredient_id', 'ingredient_name', ingredient_name, cursor, mydb)
                cursor.execute('''
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, is_essential, is_main) 
                    VALUES (%s, %s, %s, %s, %s)
                ''', (recipe_id, ingredient_id, quantity, is_essential, is_main))
        mydb.commit()

# Insert ข้อมูลจาก Sheet "หมวดหมู่ของอาหาร"
with mydb.cursor() as cursor:
    for index, row in df_categories.iterrows():
        category_name = row['category_name']
        category_image = row.get('category_image') if 'category_image' in df_categories.columns else None
        
        if pd.notna(category_name):
            category_id = get_or_create_id('categories', 'category_id', 'category_name', category_name, cursor, mydb)
            # อัปเดตตาราง categories เพื่อเพิ่มข้อมูลรูปภาพ ถ้ามี category_image
            if category_image:
                cursor.execute("UPDATE categories SET category_image = %s WHERE category_id = %s", (category_image, category_id))
    mydb.commit()

# วนลูปและ insert ข้อมูลสูตรอาหาร
with mydb.cursor() as cursor:
    for index, row in df_recipes.iterrows():
        # ใช้ re.sub เพื่อแปลงข้อความ instructions ให้มีการเว้นบรรทัดเมื่อเจอตัวเลขตามด้วยจุด
        instructions = re.sub(r'(\d+\.\s+)', r'\n\1', row['instructions'])
        category_id = get_or_create_id('categories', 'category_id', 'category_name', row['category_name'], cursor, mydb)

        cursor.execute('''
            INSERT INTO recipes (recipe_name, cooking_method, instructions, image_path, category_id) 
            VALUES (%s, %s, %s, %s, %s)
        ''', (row['recipe_name'], row['cooking_method'], instructions, row['image_path'], category_id))
        
        recipe_id = cursor.lastrowid

        # Insert วัตถุดิบและเครื่องปรุง
        insert_recipe_ingredients('main_ingredients', True, True, row, recipe_id, cursor)
        insert_recipe_ingredients('other_ingredients', False, False, row, recipe_id, cursor)
        insert_recipe_ingredients('seasonings', False, False, row, recipe_id, cursor)

        # Insert ข้อจำกัดด้านอาหาร
        if not pd.isna(row['restriction_name']):
            restriction_id = get_or_create_id('dietary_restrictions', 'restriction_id', 'restriction_name', row['restriction_name'], cursor, mydb)
            cursor.execute("INSERT INTO recipe_restrictions (recipe_id, restriction_id) VALUES (%s, %s)", 
                           (recipe_id, restriction_id))
        mydb.commit()

        # พิมพ์ข้อมูล instructions ที่ถูกแปลงแล้ว
        print(f"Updated instructions for recipe '{row['recipe_name']}':\n{instructions}\n")

# ปิดการเชื่อมต่อ
mydb.close()

print("Data inserted successfully!")
