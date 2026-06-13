const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../../../client/.env') });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is missing!');
  process.exit(1);
}

async function reset() {
  const pool = new Pool({
    connectionString: databaseUrl,
  });

  try {
    console.log('🔄 Dropping existing schema...');
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    console.log('✅ Public schema reset successfully!');

    console.log('🚀 Loading and applying schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Schema applied successfully!');

    console.log('🧹 Truncating tables before seeding...');
    await pool.query('TRUNCATE users, refresh_tokens, categories, products, floors, tables, customers, loyalty_accounts CASCADE');

    console.log('🌱 Seeding database...');
    // Create Users
    const hashedAdminPass = await bcrypt.hash('admin123', 12);
    const hashedEmployeePass = await bcrypt.hash('pos123', 12);
    const hashedKitchenPass = await bcrypt.hash('kitchen123', 12);

    // Admin
    const adminRes = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Admin User', 'admin@cafecanopy.com', hashedAdminPass, 'admin']
    );

    // Cashier/Employee
    const employeeRes = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Cashier Sam', 'cashier@cafecanopy.com', hashedEmployeePass, 'employee']
    );

    // Kitchen staff
    const kitchenRes = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Chef Maria', 'kitchen@cafecanopy.com', hashedKitchenPass, 'kitchen']
    );

    // Create Floors & Tables
    const floor1Res = await pool.query(
      `INSERT INTO floors (name, sort_order) VALUES ($1, $2) RETURNING id`,
      ['Main Floor', 1]
    );
    const floor2Res = await pool.query(
      `INSERT INTO floors (name, sort_order) VALUES ($1, $2) RETURNING id`,
      ['Rooftop Canopy', 2]
    );

    const floor1Id = floor1Res.rows[0].id;
    const floor2Id = floor2Res.rows[0].id;

    // Tables on Main Floor
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor1Id, 'Table 1', 2, 'available']);
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor1Id, 'Table 2', 4, 'available']);
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor1Id, 'Table 3', 4, 'available']);
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor1Id, 'Booth A', 6, 'available']);

    // Tables on Rooftop Canopy
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor2Id, 'Roof 1', 2, 'available']);
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor2Id, 'Roof 2', 4, 'available']);
    await pool.query(`INSERT INTO tables (floor_id, table_number, seats, status) VALUES ($1, $2, $3, $4)`, [floor2Id, 'Sky Lounge', 8, 'available']);

    // Create Categories
    const catBeverages = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Beverages', '#8B5A2B', 1]);
    const catBakery = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Bakery & Pastry', '#D2B48C', 2]);
    const catMains = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Main Course', '#C8A97A', 3]);

    const bevId = catBeverages.rows[0].id;
    const bakeId = catBakery.rows[0].id;
    const mainId = catMains.rows[0].id;

    // Create Products
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Espresso Macchiato', bevId, 180.00, 5.0, 'Rich espresso with a dollop of foamed milk.', 'cup', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Caramel Latte', bevId, 240.00, 5.0, 'Signature espresso with caramel syrup and steamed milk.', 'cup', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Hibiscus Iced Tea', bevId, 190.00, 5.0, 'Refreshing chilled herbal tea sweetened with cane sugar.', 'glass', true
    ]);

    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Almond Croissant', bakeId, 220.00, 18.0, 'Buttery, flaky croissant filled with rich almond cream.', 'piece', false
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Blueberry Muffin', bakeId, 150.00, 18.0, 'Moist muffin loaded with fresh blueberries and crumble topping.', 'piece', false
    ]);

    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Canopy Club Sandwich', mainId, 320.00, 18.0, 'Toasted sourdough with grilled chicken, bacon, lettuce, and avocado.', 'plate', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Truffle Mushroom Pasta', mainId, 450.00, 18.0, 'Penne tossed in a rich truffle cream sauce with wild mushrooms.', 'plate', true
    ]);

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await pool.end();
  }
}

reset();
