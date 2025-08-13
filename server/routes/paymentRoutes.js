const express = require('express');
const PaymentWebhookController = require('../controllers/paymentWebhookController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// M-Pesa payment notification webhook (no auth required for external webhooks)
router.post('/mpesa/notification', PaymentWebhookController.handlePaymentNotification);

// Query payment status
router.get('/status/:transactionId', protect, PaymentWebhookController.queryPaymentStatus);

// Record manual payment (landlord only)
router.post('/manual', protect, PaymentWebhookController.recordManualPayment);

module.exports = router;
