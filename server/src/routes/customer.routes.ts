import { Router } from 'express';
import { authenticate, customerOrAdmin } from '../middleware/auth';
import { query } from '../db';
import { createCustomerOrder } from '../controllers/pos.controller';

const router = Router();
router.use(authenticate);

// Recommendations
router.get('/recommendations', customerOrAdmin, async (req: any, res) => {
  try {
    const customer = await query(`SELECT id FROM customers WHERE user_id = $1`, [req.user.id]);
    const customerId = customer.rows[0]?.id;
    
    const { cart } = req.query; // cart parameter: comma-separated list of product UUIDs
    let cartProductIds: string[] = [];
    if (cart && typeof cart === 'string') {
      cartProductIds = cart.split(',').filter(id => id.length === 36);
    }

    let result;
    if (cartProductIds.length > 0 && customerId) {
      result = await query(
        `WITH together_stats AS (
          SELECT oi2.product_id, COUNT(DISTINCT oi2.order_id)::float as together_count
          FROM order_items oi1
          JOIN order_items oi2 ON oi1.order_id = oi2.order_id
          WHERE oi1.product_id = ANY($1::uuid[]) AND oi2.product_id != ALL($1::uuid[])
          GROUP BY oi2.product_id
        ),
        user_stats AS (
          SELECT oi.product_id, COUNT(oi.id)::float as user_buy_count
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.customer_id = $2 AND oi.product_id != ALL($1::uuid[])
          GROUP BY oi.product_id
        )
        SELECT p.*, 
               COALESCE(t.together_count, 0) as together_count,
               COALESCE(u.user_buy_count, 0) as user_buy_count,
               (COALESCE(t.together_count, 0) * 1.0 + COALESCE(u.user_buy_count, 0) * 1.5) as recommendation_score
        FROM products p
        LEFT JOIN together_stats t ON p.id = t.product_id
        LEFT JOIN user_stats u ON p.id = u.product_id
        WHERE p.active = true AND p.id != ALL($1::uuid[])
          AND (t.together_count > 0 OR u.user_buy_count > 0)
        ORDER BY recommendation_score DESC, p.name ASC
        LIMIT 5`,
        [cartProductIds, customerId]
      );
    } else if (customerId) {
      result = await query(
        `WITH user_stats AS (
          SELECT oi.product_id, COUNT(oi.id)::float as user_buy_count
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.customer_id = $1
          GROUP BY oi.product_id
        )
        SELECT p.*, 
               0 as together_count,
               COALESCE(u.user_buy_count, 0) as user_buy_count,
               COALESCE(u.user_buy_count, 0) * 1.5 as recommendation_score
        FROM products p
        JOIN user_stats u ON p.id = u.product_id
        WHERE p.active = true
        ORDER BY recommendation_score DESC, p.name ASC
        LIMIT 5`,
        [customerId]
      );
    }

    if (!result || result.rows.length === 0) {
      const excludeClause = cartProductIds.length > 0 ? 'WHERE p.active = true AND p.id != ALL($1::uuid[])' : 'WHERE p.active = true';
      const params = cartProductIds.length > 0 ? [cartProductIds] : [];
      result = await query(
        `SELECT p.*, 
               0 as together_count,
               0 as user_buy_count,
               COUNT(oi.id)::float as recommendation_score
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        ${excludeClause}
        GROUP BY p.id
        ORDER BY recommendation_score DESC, p.name ASC
        LIMIT 5`,
        params
      );
    }

    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Recommendations fetch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
  }
});

// Place order on a table
router.post('/orders', customerOrAdmin, createCustomerOrder);

// Fetch all active tables
router.get('/tables', customerOrAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM tables WHERE active = true ORDER BY table_number ASC');
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
});

// Fetch active coupons
router.get('/coupons', customerOrAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM coupons WHERE active = true AND (valid_until IS NULL OR valid_until > NOW())');
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// Customer dashboard
router.get('/dashboard', customerOrAdmin, async (req: any, res) => {
  try {
    const customer = await query(
      `SELECT c.*, la.points, la.tier, la.lifetime_points FROM customers c
       LEFT JOIN loyalty_accounts la ON la.customer_id = c.id WHERE c.user_id = $1`,
      [req.user.id]
    );
    if (!customer.rows[0]) return res.status(404).json({ success: false, message: 'Customer not found' });

    const stats = await query(
      `SELECT COUNT(id)::int as total_orders, COALESCE(SUM(total), 0) as lifetime_spend
       FROM orders WHERE customer_id = $1 AND status = 'paid'`,
      [customer.rows[0].id]
    );

    const recentOrders = await query(
      `SELECT o.*, json_agg(json_build_object('name', p.name, 'quantity', oi.quantity)) as items
       FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id
       WHERE o.customer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC LIMIT 5`,
      [customer.rows[0].id]
    );

    const transactions = await query(
      `SELECT * FROM loyalty_transactions WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [customer.rows[0].id]
    );

    return res.json({
      success: true,
      data: {
        customer: customer.rows[0],
        stats: stats.rows[0],
        recent_orders: recentOrders.rows,
        loyalty_transactions: transactions.rows
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

// Order history
router.get('/orders', customerOrAdmin, async (req: any, res) => {
  try {
    const customer = await query(`SELECT id FROM customers WHERE user_id = $1`, [req.user.id]);
    if (!customer.rows[0]) return res.status(404).json({ success: false, message: 'Customer not found' });

    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const orders = await query(
      `SELECT o.*, 
        json_agg(json_build_object('name', p.name, 'quantity', oi.quantity, 'price', oi.price, 'image', p.image_url)) as items,
        (SELECT json_agg(json_build_object('method', pm.name, 'amount', pay.amount))
         FROM payments pay JOIN payment_methods pm ON pay.payment_method_id = pm.id WHERE pay.order_id = o.id) as payments
       FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON oi.product_id = p.id
       WHERE o.customer_id = $1 GROUP BY o.id ORDER BY o.created_at DESC LIMIT $2 OFFSET $3`,
      [customer.rows[0].id, Number(limit), offset]
    );
    return res.json({ success: true, data: orders.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

// Bookings
router.get('/bookings', customerOrAdmin, async (req: any, res) => {
  try {
    const customer = await query(`SELECT id FROM customers WHERE user_id = $1`, [req.user.id]);
    const result = await query(
      `SELECT b.*, t.table_number FROM bookings b LEFT JOIN tables t ON b.table_id = t.id
       WHERE b.customer_id = $1 ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [customer.rows[0]?.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
});

router.post('/bookings', customerOrAdmin, async (req: any, res) => {
  try {
    const customer = await query(`SELECT id FROM customers WHERE user_id = $1`, [req.user.id]);
    const { booking_date, booking_time, guests, notes } = req.body;
    const result = await query(
      `INSERT INTO bookings (customer_id, booking_date, booking_time, guests, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [customer.rows[0].id, booking_date, booking_time, guests, notes]
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

export default router;
