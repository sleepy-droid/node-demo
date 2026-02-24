require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
});

async function checkConnection() {
  console.log('--- Environment Check ---');
  console.log(`User: [${process.env.DB_USER}]`);
  console.log(`Password length: ${process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0} characters`);
  console.log(`Host: [${process.env.DB_HOST}]`);
  
  try {
    console.log('\nAttempting connection...');
    await client.connect();
    console.log('✅ SUCCESS: Connected to PostgreSQL!');
    await client.end();
  } catch (err) {
    console.error('\n❌ CONNECTION FAILED:');
    console.error('Error Code:', err.code);
    console.error('Message:', err.message);
  }
}

checkConnection();
