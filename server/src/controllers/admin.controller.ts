import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

// ─── Products ────────────────────────────────────────────────────────────────
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, active, page = 1, limit = 50, sort = 'name', order = 'asc' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (search) { conditions.push(`p.name ILIKE $${paramIdx++}`); params.push(`%${search}%`); }
    if (category) { conditions.push(`p.category_id = $${paramIdx++}`); params.push(category); }
    if (active !== undefined) { conditions.push(`p.active = $${paramIdx++}`); params.push(active === 'true'); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = ['name', 'price', 'created_at'];
    const sortCol = allowedSort.includes(String(sort)) ? sort : 'name';

    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT p.*, c.name as category_name, c.color as category_color
         FROM products p LEFT JOIN categories c ON p.category_id = c.id
         ${where} ORDER BY p.${sortCol} ${order === 'desc' ? 'DESC' : 'ASC'}
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, Number(limit), offset]
      ),
      query(`SELECT COUNT(*) FROM products p ${where}`, params)
    ]);

    return res.json({
      success: true,
      data: dataResult.rows,
      pagination: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) }
    });
  } catch (error: any) {
    console.error('[PRODUCTS] getProducts:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name, c.color as category_color
       FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, category_id, price, tax = 0, description, unit_of_measure = 'piece', image_url, kitchen_enabled = true } = req.body;
    const result = await query(
      `INSERT INTO products (name, category_id, price, tax, description, unit_of_measure, image_url, kitchen_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, category_id || null, price, tax, description, unit_of_measure, image_url, kitchen_enabled]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Product created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, category_id, price, tax, description, unit_of_measure, image_url, kitchen_enabled, active } = req.body;
    const result = await query(
      `UPDATE products SET name=$1, category_id=$2, price=$3, tax=$4, description=$5,
       unit_of_measure=$6, image_url=$7, kitchen_enabled=$8, active=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name, category_id, price, tax, description, unit_of_measure, image_url, kitchen_enabled, active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Product updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    await query(`DELETE FROM products WHERE id = ANY($1)`, [ids]);
    return res.json({ success: true, message: `${ids.length} products deleted` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Bulk delete failed' });
  }
};

export const bulkArchiveProducts = async (req: Request, res: Response) => {
  try {
    const { ids, active } = req.body;
    await query(`UPDATE products SET active = $1, updated_at = NOW() WHERE id = ANY($2)`, [active, ids]);
    return res.json({ success: true, message: `${ids.length} products updated` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Bulk archive failed' });
  }
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    let sql = `SELECT c.*, COUNT(p.id)::int as product_count FROM categories c
               LEFT JOIN products p ON p.category_id = c.id AND p.active = true`;
    const params: any[] = [];
    if (active !== undefined) { sql += ` WHERE c.active = $1`; params.push(active === 'true'); }
    sql += ` GROUP BY c.id ORDER BY c.sort_order, c.name`;
    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, color = '#C8A97A' } = req.body;
    const result = await query(
      `INSERT INTO categories (name, color) VALUES ($1, $2) RETURNING *`,
      [name, color]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Category created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, color, active, sort_order } = req.body;
    const result = await query(
      `UPDATE categories SET name=$1, color=$2, active=$3, sort_order=$4 WHERE id=$5 RETURNING *`,
      [name, color, active, sort_order, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Category not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Category updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM categories WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// ─── Floors ─────────────────────────────────────────────────────────────────
export const getFloors = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT f.*, json_agg(t.* ORDER BY t.table_number) FILTER (WHERE t.id IS NOT NULL) as tables
       FROM floors f LEFT JOIN tables t ON t.floor_id = f.id
       WHERE f.active = true GROUP BY f.id ORDER BY f.sort_order, f.name`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch floors' });
  }
};

export const createFloor = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const result = await query(`INSERT INTO floors (name) VALUES ($1) RETURNING *`, [name]);
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Floor created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create floor' });
  }
};

export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { name, active } = req.body;
    const result = await query(
      `UPDATE floors SET name=$1, active=$2 WHERE id=$3 RETURNING *`,
      [name, active, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update floor' });
  }
};

export const deleteFloor = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM floors WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Floor deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete floor' });
  }
};

// ─── Tables ─────────────────────────────────────────────────────────────────
export const getTables = async (req: Request, res: Response) => {
  try {
    const { floor_id, status } = req.query;
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (floor_id) { conditions.push(`t.floor_id = $${idx++}`); params.push(floor_id); }
    if (status) { conditions.push(`t.status = $${idx++}`); params.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
      `SELECT t.*, f.name as floor_name,
        (SELECT o.id FROM orders o WHERE o.table_id = t.id AND o.status IN ('draft', 'sent_to_kitchen', 'preparing') LIMIT 1) as active_order_id
       FROM tables t JOIN floors f ON t.floor_id = f.id ${where} ORDER BY f.sort_order, t.table_number`,
      params
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { floor_id, table_number, seats = 4, shape = 'square', position_x = 0, position_y = 0 } = req.body;
    const result = await query(
      `INSERT INTO tables (floor_id, table_number, seats, shape, position_x, position_y) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [floor_id, table_number, seats, shape, position_x, position_y]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Table created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create table' });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const { table_number, seats, shape, position_x, position_y, active, status } = req.body;
    const result = await query(
      `UPDATE tables SET table_number=$1, seats=$2, shape=$3, position_x=$4, position_y=$5, active=$6, status=$7 WHERE id=$8 RETURNING *`,
      [table_number, seats, shape, position_x, position_y, active, status, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update table' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM tables WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete table' });
  }
};

// ─── Employees ───────────────────────────────────────────────────────────────
export const getEmployees = async (req: Request, res: Response) => {
  try {
    const { search, role, active, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const conditions = [`u.role != 'customer'`];
    const params: any[] = [];
    let idx = 1;
    if (search) { conditions.push(`(u.name ILIKE $${idx++} OR u.email ILIKE $${idx++})`); params.push(`%${search}%`, `%${search}%`); }
    if (role) { conditions.push(`u.role = $${idx++}`); params.push(role); }
    if (active !== undefined) { conditions.push(`u.active = $${idx++}`); params.push(active === 'true'); }
    const where = `WHERE ${conditions.join(' AND ')}`;
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT id, name, email, role, active, avatar_url, last_login, created_at FROM users u ${where}
         ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
        [...params, Number(limit), offset]
      ),
      query(`SELECT COUNT(*) FROM users u ${where}`, params)
    ]);
    return res.json({
      success: true, data: dataResult.rows,
      pagination: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (exists.rows[0]) return res.status(409).json({ success: false, message: 'Email already exists' });
    const hashed = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, active, created_at`,
      [name, email, hashed, role]
    );
    return res.status(201).json({ success: true, data: result.rows[0], message: 'Employee created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create employee' });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, role, active } = req.body;
    const result = await query(
      `UPDATE users SET name=$1, email=$2, role=$3, active=$4, updated_at=NOW() WHERE id=$5 AND role != 'customer'
       RETURNING id, name, email, role, active`,
      [name, email, role, active, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Employee not found' });
    return res.json({ success: true, data: result.rows[0], message: 'Employee updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update employee' });
  }
};

export const resetEmployeePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 12);
    await query(`UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2`, [hashed, req.params.id]);
    await query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    // Soft delete: just deactivate
    await query(`UPDATE users SET active = false WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Employee archived' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete employee' });
  }
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let where = '';
    if (search) { where = `WHERE c.name ILIKE $1 OR c.email ILIKE $1 OR c.phone ILIKE $1`; params.push(`%${search}%`); }
    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT c.*, la.points, la.tier, la.lifetime_points,
          COUNT(o.id)::int as order_count,
          COALESCE(SUM(o.total), 0) as lifetime_spend
         FROM customers c LEFT JOIN loyalty_accounts la ON la.customer_id = c.id
         LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
         ${where} GROUP BY c.id, la.points, la.tier, la.lifetime_points
         ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, Number(limit), offset]
      ),
      query(`SELECT COUNT(*) FROM customers c ${where}`, params)
    ]);
    return res.json({
      success: true, data: dataResult.rows,
      pagination: { total: Number(countResult.rows[0].count), page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const result = await query(
      `INSERT INTO customers (name, email, phone) VALUES ($1,$2,$3) RETURNING *`,
      [name, email, phone]
    );
    const customer = result.rows[0];
    await query(`INSERT INTO loyalty_accounts (customer_id) VALUES ($1)`, [customer.id]);
    return res.status(201).json({ success: true, data: customer, message: 'Customer created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const result = await query(
      `UPDATE customers SET name=$1, email=$2, phone=$3, updated_at=NOW() WHERE id=$4 RETURNING *`,
      [name, email, phone, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Customer not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM customers WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
};

export const getCustomerHistory = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT o.*, u.name as employee_name,
        json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
       FROM orders o LEFT JOIN users u ON o.employee_id = u.id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.customer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC LIMIT 20`,
      [req.params.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch customer history' });
  }
};

// ─── Payment Methods ─────────────────────────────────────────────────────────
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    let sql = `SELECT * FROM payment_methods`;
    const params: any[] = [];
    if (active !== undefined) { sql += ` WHERE active = $1`; params.push(active === 'true'); }
    sql += ` ORDER BY sort_order, name`;
    const result = await query(sql, params);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payment methods' });
  }
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { name, type, upi_id } = req.body;
    const result = await query(
      `INSERT INTO payment_methods (name, type, upi_id) VALUES ($1,$2,$3) RETURNING *`,
      [name, type, upi_id]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create payment method' });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { name, type, upi_id, active } = req.body;
    const result = await query(
      `UPDATE payment_methods SET name=$1, type=$2, upi_id=$3, active=$4 WHERE id=$5 RETURNING *`,
      [name, type, upi_id, active, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update payment method' });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM payment_methods WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Payment method deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete payment method' });
  }
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export const getCoupons = async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { name, code, discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, valid_until } = req.body;
    const result = await query(
      `INSERT INTO coupons (name, code, discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [name, code.toUpperCase(), discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, valid_until]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ success: false, message: 'Coupon code already exists' });
    return res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { name, code, discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, valid_until, active } = req.body;
    const result = await query(
      `UPDATE coupons SET name=$1, code=$2, discount_type=$3, discount_value=$4, minimum_amount=$5,
       maximum_discount=$6, usage_limit=$7, valid_until=$8, active=$9 WHERE id=$10 RETURNING *`,
      [name, code?.toUpperCase(), discount_type, discount_value, minimum_amount, maximum_discount, usage_limit, valid_until, active, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM coupons WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};

export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const { code, order_total } = req.body;
    const result = await query(
      `SELECT * FROM coupons WHERE code = $1 AND active = true
       AND (valid_until IS NULL OR valid_until > NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)`,
      [code.toUpperCase()]
    );
    const coupon = result.rows[0];
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    if (coupon.minimum_amount && order_total < coupon.minimum_amount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ₹${coupon.minimum_amount}` });
    }
    let discount = coupon.discount_type === 'percentage'
      ? (order_total * coupon.discount_value) / 100
      : coupon.discount_value;
    if (coupon.maximum_discount) discount = Math.min(discount, coupon.maximum_discount);
    return res.json({ success: true, data: { ...coupon, calculated_discount: discount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
};

// ─── Promotions ──────────────────────────────────────────────────────────────
export const getPromotions = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT pr.*, p.name as product_name, c.name as category_name FROM promotions pr
       LEFT JOIN products p ON pr.product_id = p.id LEFT JOIN categories c ON pr.category_id = c.id
       ORDER BY pr.created_at DESC`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch promotions' });
  }
};

export const createPromotion = async (req: Request, res: Response) => {
  try {
    const { name, promotion_type, apply_on, product_id, category_id, minimum_quantity, minimum_amount, discount_type, discount_value, valid_until } = req.body;
    const result = await query(
      `INSERT INTO promotions (name, promotion_type, apply_on, product_id, category_id, minimum_quantity, minimum_amount, discount_type, discount_value, valid_until)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, promotion_type, apply_on, product_id, category_id, minimum_quantity, minimum_amount, discount_type, discount_value, valid_until]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create promotion' });
  }
};

export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { name, promotion_type, apply_on, product_id, category_id, minimum_quantity, minimum_amount, discount_type, discount_value, valid_until, active } = req.body;
    const result = await query(
      `UPDATE promotions SET name=$1, promotion_type=$2, apply_on=$3, product_id=$4, category_id=$5,
       minimum_quantity=$6, minimum_amount=$7, discount_type=$8, discount_value=$9, valid_until=$10, active=$11 WHERE id=$12 RETURNING *`,
      [name, promotion_type, apply_on, product_id, category_id, minimum_quantity, minimum_amount, discount_type, discount_value, valid_until, active, req.params.id]
    );
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update promotion' });
  }
};

export const deletePromotion = async (req: Request, res: Response) => {
  try {
    await query(`DELETE FROM promotions WHERE id = $1`, [req.params.id]);
    return res.json({ success: true, message: 'Promotion deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete promotion' });
  }
};

export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT pr.*, p.name as product_name FROM promotions pr
       LEFT JOIN products p ON pr.product_id = p.id
       WHERE pr.active = true AND (pr.valid_until IS NULL OR pr.valid_until > NOW())
       ORDER BY pr.promotion_type, pr.created_at`
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch promotions' });
  }
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT key, value FROM settings`);
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return res.json({ success: true, data: settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const promises = Object.entries(updates).map(([key, value]) =>
      query(
        `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      )
    );
    await Promise.all(promises);
    return res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
