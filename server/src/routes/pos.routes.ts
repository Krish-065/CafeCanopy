import { Router } from 'express';
import { authenticate, adminOrEmployee, kitchenOrAdmin, adminOnly } from '../middleware/auth';
import * as pos from '../controllers/pos.controller';

const router = Router();
router.use(authenticate);

// Sessions
router.get('/sessions', adminOnly, pos.getSessions);
router.get('/sessions/current', adminOrEmployee, pos.getOpenSession);
router.post('/sessions/open', adminOrEmployee, pos.openSession);
router.post('/sessions/:id/close', adminOrEmployee, pos.closeSession);

// Orders
router.get('/orders', adminOrEmployee, pos.getOrders);
router.get('/orders/:id', adminOrEmployee, pos.getOrder);
router.post('/orders', adminOrEmployee, pos.createOrder);
router.put('/orders/:id', adminOrEmployee, pos.updateOrder);
router.post('/orders/:id/cancel', adminOrEmployee, pos.cancelOrder);
router.post('/orders/:id/send-to-kitchen', adminOrEmployee, pos.sendToKitchen);
router.post('/orders/:id/payment', adminOrEmployee, pos.processPayment);

// Kitchen
router.get('/kitchen/tickets', kitchenOrAdmin, pos.getKitchenTickets);
router.put('/kitchen/tickets/:id', kitchenOrAdmin, pos.updateKitchenTicket);
router.put('/kitchen/items/:itemId/status', kitchenOrAdmin, pos.updateOrderItemStatus);

// Reports
router.get('/reports', adminOnly, pos.getReports);

export default router;
