require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test Database Connection and Create Table if it doesn't exist
const initDb = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log('✅ Connected to PostgreSQL and table "items" is ready.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
};
initDb();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// GET Route for Home Page (handled by express.static)

// POST Route to add an item to the database
app.post('/add-item', async (req, res) => {
  const { itemName, itemPrice } = req.body;
  
  if (itemName && itemPrice) {
    try {
      const insertQuery = 'INSERT INTO items (name, price) VALUES ($1, $2)';
      await pool.query(insertQuery, [itemName, parseFloat(itemPrice)]);
      console.log(`📦 New item added to database: ${itemName}`);
    } catch (err) {
      console.error('❌ Error adding item:', err.message);
    }
  }
  res.redirect('/catalog');
});

// GET Route to view the catalog from the database
app.get('/catalog', async (req, res) => {
  try {
    const result = await pool.query('SELECT name, price FROM items ORDER BY created_at DESC');
    const items = result.rows;

    let catalogHtml = '<h1>My Music Catalog</h1><ul>';
    items.forEach(item => {
      catalogHtml += `<li><strong>${item.name}</strong> - $${parseFloat(item.price).toFixed(2)}</li>`;
    });
    
    catalogHtml += '</ul><br><a href="/">Back to Form</a>';
    res.send(catalogHtml);
  } catch (err) {
    console.error('❌ Error fetching catalog:', err.message);
    res.status(500).send('Error loading catalog.');
  }
});

app.listen(port, () => {
  console.log(`🎧 Server is running! Open http://localhost:${port} in your browser`);
});
