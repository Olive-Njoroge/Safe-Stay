const Bill = require('../models/Bills');
const User = require('../models/User');
const africasTalkingService = require('../services/africasTalkingService');

class PaymentWebhookController {
  // Handle M-Pesa payment notifications from Africa's Talking
  static async handlePaymentNotification(req, res) {
    try {
      const { 
        transactionId,
        phoneNumber,
        amount,
        status,
        requestId,
        metadata 
      } = req.body;

      console.log('Payment notification received:', req.body);

      if (status === 'Success') {
        // Find the bill from metadata
        const billId = metadata?.billId;
        if (!billId) {
          console.error('No bill ID in payment metadata');
          return res.status(400).json({ error: 'Invalid payment metadata' });
        }

        const bill = await Bill.findById(billId).populate('tenant landlord');
        if (!bill) {
          console.error('Bill not found:', billId);
          return res.status(404).json({ error: 'Bill not found' });
        }

        // Update bill with payment
        const paymentAmount = parseFloat(amount);
        bill.paidAmount += paymentAmount;
        bill.remainingAmount = Math.max(0, bill.amount - bill.paidAmount);

        // Update payment history
        bill.paymentHistory.push({
          amount: paymentAmount,
          date: new Date(),
          method: 'M-Pesa',
          transactionId: transactionId
        });

        // Update status
        if (bill.remainingAmount === 0) {
          bill.status = 'Paid';
          bill.paymentDate = new Date();
        } else {
          bill.status = 'Partial';
        }

        await bill.save();

        // Send confirmation SMS to tenant
        await africasTalkingService.sendPaymentConfirmation(
          bill.tenant, 
          { amount: paymentAmount }, 
          bill
        );

        // Notify landlord
        const landlordMessage = `SafeStay: Payment received from ${bill.tenant.name} (${bill.tenant.apartmentName}). Amount: KSh ${paymentAmount} for ${bill.month} ${bill.year}. Remaining: KSh ${bill.remainingAmount}`;
        await africasTalkingService.sendSMS(bill.landlord.primaryPhoneNumber, landlordMessage);

        console.log(`Payment processed successfully for bill ${billId}`);
        res.json({ success: true, message: 'Payment processed successfully' });

      } else {
        console.log('Payment failed:', status);
        res.json({ success: true, message: 'Payment status noted' });
      }

    } catch (error) {
      console.error('Payment notification error:', error);
      res.status(500).json({ error: 'Error processing payment notification' });
    }
  }

  // Handle payment status queries
  static async queryPaymentStatus(req, res) {
    try {
      const { transactionId } = req.params;
      
      // Find bill with this transaction ID
      const bill = await Bill.findOne({
        'paymentHistory.transactionId': transactionId
      }).populate('tenant');

      if (!bill) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const payment = bill.paymentHistory.find(p => p.transactionId === transactionId);
      
      res.json({
        success: true,
        payment: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          date: payment.date,
          method: payment.method,
          tenant: bill.tenant.name,
          bill: `${bill.month} ${bill.year}`,
          status: 'Completed'
        }
      });

    } catch (error) {
      console.error('Payment query error:', error);
      res.status(500).json({ error: 'Error querying payment status' });
    }
  }

  // Manual payment recording (for cash payments, etc.)
  static async recordManualPayment(req, res) {
    try {
      const { billId, amount, method, notes } = req.body;

      const bill = await Bill.findById(billId).populate('tenant landlord');
      if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
      }

      const paymentAmount = parseFloat(amount);
      
      // Validate payment amount
      if (paymentAmount <= 0 || paymentAmount > bill.remainingAmount) {
        return res.status(400).json({ error: 'Invalid payment amount' });
      }

      // Update bill
      bill.paidAmount += paymentAmount;
      bill.remainingAmount = Math.max(0, bill.amount - bill.paidAmount);

      // Add to payment history
      bill.paymentHistory.push({
        amount: paymentAmount,
        date: new Date(),
        method: method || 'Cash',
        notes: notes
      });

      // Update status
      if (bill.remainingAmount === 0) {
        bill.status = 'Paid';
        bill.paymentDate = new Date();
      } else {
        bill.status = 'Partial';
      }

      await bill.save();

      // Send confirmation SMS
      await africasTalkingService.sendPaymentConfirmation(
        bill.tenant, 
        { amount: paymentAmount }, 
        bill
      );

      res.json({
        success: true,
        message: 'Payment recorded successfully',
        bill: {
          id: bill._id,
          paidAmount: bill.paidAmount,
          remainingAmount: bill.remainingAmount,
          status: bill.status
        }
      });

    } catch (error) {
      console.error('Manual payment recording error:', error);
      res.status(500).json({ error: 'Error recording payment' });
    }
  }
}

module.exports = PaymentWebhookController;
