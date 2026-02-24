require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const initDb = async () => {
  try {
    // Users table for accounts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Refined Tracks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tracks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        primary_artist VARCHAR(100) DEFAULT 'sleepyred999',
        featured_artist VARCHAR(100),
        genre VARCHAR(50),
        price NUMERIC(10, 2) NOT NULL,
        cover_art_url TEXT,
        preview_url TEXT,
        file_path TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all existing tracks use the new stage name
    await pool.query("UPDATE tracks SET primary_artist = 'sleepyred999' WHERE primary_artist = 'Sleepy.RED'");

    // Ownership Join Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_library (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        track_id INTEGER REFERENCES tracks(id) ON DELETE CASCADE,
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, track_id)
      );
    `);

    console.log('✅ Specific Music Store Schema is active! Artist: sleepyred999');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
};
initDb();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Storefront: Add a new track
app.post('/add-track', async (req, res) => {
  const { title, featured_artist, genre, price, cover_art_url } = req.body;
  
  try {
    const query = `
      INSERT INTO tracks (title, featured_artist, genre, price, cover_art_url) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [title, featured_artist || null, genre, parseFloat(price), cover_art_url]);
    console.log(`🎵 Track added: ${title}`);
  } catch (err) {
    console.error('❌ Error adding track:', err.message);
  }
  res.redirect('/catalog');
});

// Catalog: View all tracks
app.get('/catalog', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tracks ORDER BY created_at DESC');
    const tracks = result.rows;

    let html = '<h1>Music Storefront</h1><div style="display:flex; flex-wrap:wrap; gap:20px;">';
    
    tracks.forEach(track => {
      html += `
        <div style="border:1px solid #ddd; padding:15px; border-radius:8px; width:200px;">
          <img src="${track.cover_art_url || 'https://via.placeholder.com/150'}" style="width:100%; border-radius:4px;">
          <h3>${track.title}</h3>
          <p>Artist: ${track.primary_artist} ${track.featured_artist ? '(ft. '+track.featured_artist+')' : ''}</p>
          <p>Genre: ${track.genre}</p>
          <p><strong>$${parseFloat(track.price).toFixed(2)}</strong></p>
          <form action="/delete-track/${track.id}" method="POST">
            <button type="submit" style="color:red; background:none; border:1px solid red; cursor:pointer;">Remove</button>
          </form>
        </div>`;
    });
    
    html += '</div><br><a href="/">Add More Music</a>';
    res.send(html);
  } catch (err) {
    res.status(500).send('Error loading store.');
  }
});

app.post('/delete-track/:id', async (req, res) => {
  await pool.query('DELETE FROM tracks WHERE id = $1', [req.params.id]);
  res.redirect('/catalog');
});

app.listen(port, () => {
  console.log(`🎧 Store running at http://localhost:${port}`);
});
