import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    console.log('Altering database to allow nullable employee_id on orders...');
    await pool.query('ALTER TABLE orders ALTER COLUMN employee_id DROP NOT NULL;');
    console.log('✅ Altered database successfully!');
  } catch (error: any) {
    console.error('❌ Alteration failed:', error.message);
  } finally {
    await pool.end();
  }
}

run();
