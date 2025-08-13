const AfricasTalking = require('africastalking');

class AfricasTalkingService {
  constructor() {
    this.AT = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME
    });
    
    this.sms = this.AT.SMS;
    this.payments = this.AT.PAYMENTS;
  }

  // Send SMS notification
  async sendSMS(phoneNumber, message) {
    try {
      const options = {
        to: [phoneNumber],
        message: message,
        from: 'SafeStay'
      };

      const result = await this.sms.send(options);
      console.log('SMS sent successfully:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('SMS Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Initiate M-Pesa payment
  async initiateMpesaPayment(phoneNumber, amount, billId) {
    try {
      const options = {
        productName: 'SafeStay',
        phoneNumber: phoneNumber,
        currencyCode: 'KES',
        amount: amount,
        metadata: {
          billId: billId,
          service: 'rent_payment'
        }
      };

      const result = await this.payments.mobileCheckout(options);
      console.log('M-Pesa payment initiated:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('M-Pesa Payment Error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send bill reminder
  async sendBillReminder(tenant, bill) {
    const message = `SafeStay Reminder: Your ${bill.month} ${bill.year} rent of KSh ${bill.amount} is due on ${bill.dueDate.toDateString()}. Pay via USSD: ${process.env.USSD_CODE}`;
    
    return await this.sendSMS(tenant.primaryPhoneNumber, message);
  }

  // Send payment confirmation
  async sendPaymentConfirmation(tenant, payment, bill) {
    const message = `SafeStay: Payment of KSh ${payment.amount} received for ${bill.month} ${bill.year}. Balance: KSh ${bill.remainingAmount}. Thank you!`;
    
    return await this.sendSMS(tenant.primaryPhoneNumber, message);
  }

  // Send complaint acknowledgment
  async sendComplaintAcknowledgment(tenant, complaint) {
    const message = `SafeStay: Your complaint (${complaint.category}) has been received and forwarded to your landlord. Reference: ${complaint._id}`;
    
    return await this.sendSMS(tenant.primaryPhoneNumber, message);
  }

  // Notify landlord of new complaint
  async notifyLandlordOfComplaint(landlord, tenant, complaint) {
    const message = `SafeStay: New complaint from ${tenant.name} (${tenant.apartmentName}). Category: ${complaint.category}. Check your dashboard for details.`;
    
    return await this.sendSMS(landlord.primaryPhoneNumber, message);
  }

  // Send welcome message to new user
  async sendWelcomeMessage(user) {
    const message = `Welcome to SafeStay, ${user.name}! Access your account anytime via USSD: ${process.env.USSD_CODE}. For support, contact your landlord.`;
    
    return await this.sendSMS(user.primaryPhoneNumber, message);
  }
}

module.exports = new AfricasTalkingService();
