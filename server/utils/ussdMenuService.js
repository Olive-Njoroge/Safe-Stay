class USSDMenuService {
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount).replace('KES', 'KSh');
  }

  static formatDate(date) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  static truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static buildMenu(title, options, showBack = true) {
    let menu = `CON ${title}\n\n`;
    
    options.forEach((option, index) => {
      menu += `${index + 1}. ${option}\n`;
    });

    if (showBack) {
      menu += '\n0. Back to Main Menu';
    }

    return menu;
  }

  static buildEndMessage(title, content) {
    return `END ${title}\n\n${content}\n\nThank you for using SafeStay!`;
  }

  static validatePhoneNumber(phoneNumber) {
    // Remove any spaces, dashes, or plus signs
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Check if it's a valid Kenyan phone number
    const kenyanPattern = /^(254|0)?[17]\d{8}$/;
    return kenyanPattern.test(cleaned);
  }

  static normalizePhoneNumber(phoneNumber) {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Convert to international format (254...)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  }

  static generateSessionId() {
    return `ussd_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  static isValidAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M KES
  }

  static calculateDaysOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  static getBillStatusIcon(status) {
    switch (status) {
      case 'Paid': return '✓';
      case 'Partial': return '⚠';
      case 'Pending': return '⏳';
      default: return '•';
    }
  }

  static getPriorityLevel(bill) {
    const daysOverdue = this.calculateDaysOverdue(bill.dueDate);
    if (daysOverdue > 30) return 'HIGH';
    if (daysOverdue > 7) return 'MEDIUM';
    return 'LOW';
  }

  static formatBillSummary(bill) {
    const status = this.getBillStatusIcon(bill.status);
    const amount = this.formatCurrency(bill.remainingAmount || bill.amount);
    const date = this.formatDate(bill.dueDate);
    const daysOverdue = this.calculateDaysOverdue(bill.dueDate);
    
    let summary = `${status} ${bill.month} ${bill.year} - ${amount}`;
    if (daysOverdue > 0) {
      summary += ` (${daysOverdue}d overdue)`;
    }
    
    return summary;
  }

  static parseUSSDInput(text) {
    if (!text) return [];
    return text.split('*').filter(item => item.trim() !== '');
  }

  static getLastInput(text) {
    const inputs = this.parseUSSDInput(text);
    return inputs.length > 0 ? inputs[inputs.length - 1] : '';
  }

  static buildComplaintCategories() {
    return [
      'Maintenance Issue',
      'Noise Complaint', 
      'Security Issue',
      'Billing Issue',
      'Landlord Issue',
      'Utility Problem',
      'Other'
    ];
  }

  static buildPaymentMethods() {
    return [
      'M-Pesa',
      'Bank Transfer',
      'Cash',
      'Other'
    ];
  }
}

module.exports = USSDMenuService;
