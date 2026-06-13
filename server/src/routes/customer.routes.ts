import { Router } from 'express';
import { authenticate, customerOrAdmin } from '../middleware/auth';
import { query } from '../db';

const router = Router();
router.use(authenticate);

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
       WHERE o.customer_id = $1 AND o.status = 'paid' GROUP BY o.id ORDER BY o.created_at DESC LIMIT 5`,
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
