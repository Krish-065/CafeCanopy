import { Router } from 'express';
import { authenticate, adminOnly, adminOrEmployee } from '../middleware/auth';
import * as admin from '../controllers/admin.controller';
import { uploadMiddleware, handleImageUpload } from '../services/upload.service';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Products
router.get('/products', admin.getProducts);
router.get('/products/:id', admin.getProduct);
router.post('/products', adminOnly, admin.createProduct);
router.put('/products/:id', adminOnly, admin.updateProduct);
router.delete('/products/:id', adminOnly, admin.deleteProduct);
router.post('/products/bulk-delete', adminOnly, admin.bulkDeleteProducts);
router.post('/products/bulk-archive', adminOnly, admin.bulkArchiveProducts);
router.post('/products/upload-image', adminOnly, uploadMiddleware, handleImageUpload);

// Categories
router.get('/categories', admin.getCategories);
router.post('/categories', adminOnly, admin.createCategory);
router.put('/categories/:id', adminOnly, admin.updateCategory);
router.delete('/categories/:id', adminOnly, admin.deleteCategory);

// Floors
router.get('/floors', admin.getFloors);
router.post('/floors', adminOnly, admin.createFloor);
router.put('/floors/:id', adminOnly, admin.updateFloor);
router.delete('/floors/:id', adminOnly, admin.deleteFloor);

// Tables
router.get('/tables', admin.getTables);
router.post('/tables', adminOnly, admin.createTable);
router.put('/tables/:id', adminOnly, admin.updateTable);
router.delete('/tables/:id', adminOnly, admin.deleteTable);

// Employees
router.get('/employees', adminOnly, admin.getEmployees);
router.post('/employees', adminOnly, admin.createEmployee);
router.put('/employees/:id', adminOnly, admin.updateEmployee);
router.post('/employees/:id/reset-password', adminOnly, admin.resetEmployeePassword);
router.delete('/employees/:id', adminOnly, admin.deleteEmployee);

// Customers
router.get('/customers', adminOrEmployee, admin.getCustomers);
router.post('/customers', adminOrEmployee, admin.createCustomer);
router.put('/customers/:id', adminOrEmployee, admin.updateCustomer);
router.delete('/customers/:id', adminOnly, admin.deleteCustomer);
router.get('/customers/:id/history', adminOrEmployee, admin.getCustomerHistory);

// Payment Methods
router.get('/payment-methods', admin.getPaymentMethods);
router.post('/payment-methods', adminOnly, admin.createPaymentMethod);
router.put('/payment-methods/:id', adminOnly, admin.updatePaymentMethod);
router.delete('/payment-methods/:id', adminOnly, admin.deletePaymentMethod);

// Coupons
router.get('/coupons', adminOrEmployee, admin.getCoupons);
router.post('/coupons', adminOnly, admin.createCoupon);
router.put('/coupons/:id', adminOnly, admin.updateCoupon);
router.delete('/coupons/:id', adminOnly, admin.deleteCoupon);
router.post('/coupons/validate', adminOrEmployee, admin.validateCoupon);

// Promotions
router.get('/promotions', admin.getPromotions);
router.get('/promotions/active', adminOrEmployee, admin.getActivePromotions);
router.post('/promotions', adminOnly, admin.createPromotion);
router.put('/promotions/:id', adminOnly, admin.updatePromotion);
router.delete('/promotions/:id', adminOnly, admin.deletePromotion);

// Settings
router.get('/settings', admin.getSettings);
router.put('/settings', adminOnly, admin.updateSettings);

export default router;
