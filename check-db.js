require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkConnection() {
  console.log('--- Database Connection Test ---');
  console.log(`Connecting to: ${process.env.DB_NAME} as ${process.env.DB_USER}...`);
  
  try {
    await client.connect();
    console.log('✅ SUCCESS: Connected to PostgreSQL!');
    
    const res = await client.query('SELECT NOW()');
    console.log('🕒 Server Time:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
    console.log('
Common Fixes:');
    console.log('1. Check if the database "storefront" exists.');
    console.log('2. Verify the DB_PASSWORD in your .env is correct.');
    console.log('3. Ensure PostgreSQL is running on port 5432.');
  }
}

checkConnection();
