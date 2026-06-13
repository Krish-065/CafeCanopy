import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // 1. Clear existing data
    await pool.query('TRUNCATE users, refresh_tokens, categories, products, floors, tables, customers, loyalty_accounts CASCADE');

    // 2. Create Users
    const hashedAdminPass = await bcrypt.hash('admin123', 12);
    const hashedEmployeePass = await bcrypt.hash('pos123', 12);
    const hashedKitchenPass = await bcrypt.hash('kitchen123', 12);

    // Admin
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Admin User', 'admin@cafecanopy.com', hashedAdminPass, 'admin']
    );

    // Cashier/Employee
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Cashier Sam', 'cashier@cafecanopy.com', hashedEmployeePass, 'employee']
    );

    // Kitchen staff
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Chef Maria', 'kitchen@cafecanopy.com', hashedKitchenPass, 'kitchen']
    );

    console.log('✅ Created users:');
    console.log('   - Admin: admin@cafecanopy.com (password: admin123)');
    console.log('   - Cashier: cashier@cafecanopy.com (password: pos123)');
    console.log('   - Kitchen: kitchen@cafecanopy.com (password: kitchen123)');

    // 3. Create Floors & Tables
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

    console.log('✅ Seeded floors and tables.');

    // 4. Create Categories
    const catBeverages = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Beverages', '#8B5A2B', 1]);
    const catBakery = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Bakery & Pastry', '#D2B48C', 2]);
    const catMains = await pool.query(`INSERT INTO categories (name, color, sort_order) VALUES ($1, $2, $3) RETURNING id`, ['Main Course', '#C8A97A', 3]);

    const bevId = catBeverages.rows[0].id;
    const bakeId = catBakery.rows[0].id;
    const mainId = catMains.rows[0].id;

    // 5. Create Products
    // Beverages
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Espresso Macchiato', bevId, 180.00, 5.0, 'Rich espresso with a dollop of foamed milk.', 'cup', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Caramel Latte', bevId, 240.00, 5.0, 'Signature espresso with caramel syrup and steamed milk.', 'cup', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Hibiscus Iced Tea', bevId, 190.00, 5.0, 'Refreshing chilled herbal tea sweetened with cane sugar.', 'glass', true
    ]);

    // Bakery
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Almond Croissant', bakeId, 220.00, 18.0, 'Buttery, flaky croissant filled with rich almond cream.', 'piece', false
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Blueberry Muffin', bakeId, 150.00, 18.0, 'Moist muffin loaded with fresh blueberries and crumble topping.', 'piece', false
    ]);

    // Mains
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Canopy Club Sandwich', mainId, 320.00, 18.0, 'Toasted sourdough with grilled chicken, bacon, lettuce, and avocado.', 'plate', true
    ]);
    await pool.query(`INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, kitchen_enabled) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
      'Truffle Mushroom Pasta', mainId, 450.00, 18.0, 'Penne tossed in a rich truffle cream sauce with wild mushrooms.', 'plate', true
    ]);

    console.log('✅ Seeded products and categories.');
    console.log('🌱 Seeding process complete!');
  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seed();
