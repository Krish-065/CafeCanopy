import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  // Parse connection string to connect to 'postgres' default database first
  // to run the CREATE DATABASE query.
  let defaultDbUrl = dbUrl;
  try {
    const url = new URL(dbUrl);
    url.pathname = '/postgres';
    defaultDbUrl = url.toString();
  } catch (e) {
    // fallback string replacement if URL parse fails
    defaultDbUrl = dbUrl.replace(/\/[a-zA-Z0-9_-]+(\?.*)?$/, '/postgres$1');
  }

  console.log('Connecting to default database to create "cafecanopy"...');
  const client = new Client({
    connectionString: defaultDbUrl,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE cafecanopy;');
    console.log('✅ Database "cafecanopy" created successfully!');
  } catch (error: any) {
    if (error.code === '42P04') {
      console.log('ℹ️  Database "cafecanopy" already exists.');
    } else {
      console.error('❌ Failed to create database:', error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
