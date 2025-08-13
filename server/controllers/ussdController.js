const UssdSession = require('../models/UssdSession');
const User = require('../models/User');
const Bill = require('../models/Bills');
const Complaint = require('../models/Complaint');
const USSDMenuService = require('../utils/ussdMenuService');
const africasTalkingService = require('../services/africasTalkingService');

class USSDController {
  static async handleUSSD(req, res) {
    try {
      const { sessionId, serviceCode, phoneNumber, text } = req.body;

      // Normalize phone number
      const normalizedPhone = USSDMenuService.normalizePhoneNumber(phoneNumber);

      // Get or create session
      let session = await UssdSession.findOne({ sessionId });
      if (!session) {
        session = new UssdSession({
          sessionId,
          phoneNumber: normalizedPhone,
          currentStep: 'main_menu'
        });
      }

      // Find user by phone number
      const user = await User.findOne({ 
        $or: [
          { primaryPhoneNumber: normalizedPhone },
          { secondaryPhoneNumber: normalizedPhone },
          { primaryPhoneNumber: phoneNumber },
          { secondaryPhoneNumber: phoneNumber }
        ]
      });

      if (user) {
        session.userId = user._id;
      }

      const inputArray = USSDMenuService.parseUSSDInput(text);
      const lastInput = USSDMenuService.getLastInput(text);

      let response = '';
      let endSession = false;

      // Handle unregistered users
      if (!user) {
        response = USSDMenuService.buildEndMessage(
          'Access Denied',
          'Your phone number is not registered with SafeStay.\n\nPlease contact your landlord to register your number.\n\nFor support: info@safestay.com'
        );
        endSession = true;
      } else {
        // Handle initial session (empty text)
        if (text === '' || text === null || text === undefined) {
          session.currentStep = 'main_menu';
          response = await USSDController.showMainMenu(user);
          endSession = false;
        } else {
          // Route to appropriate handler based on current step
          const result = await USSDController.routeRequest(user, session, lastInput, inputArray);
          response = result.response;
          endSession = result.endSession;
        }
      }

      // Handle session end
      if (endSession) {
        session.isActive = false;
      }
      
      await session.save();

      res.set('Content-Type', 'text/plain');
      res.send(response);

    } catch (error) {
      console.error('USSD Error:', error);
      res.set('Content-Type', 'text/plain');
      res.send('END Sorry, there was a technical error. Please try again later or contact support.');
    }
  }

  static async routeRequest(user, session, lastInput, inputArray) {
    try {
      switch (session.currentStep) {
        case 'main_menu':
          // If we have input, process the main menu choice
          if (lastInput && lastInput !== '') {
            session.currentStep = 'awaiting_main_choice';
            return await USSDController.handleMainMenuChoice(lastInput, user, session);
          } else {
            // Show main menu
            return { response: await USSDController.showMainMenu(user), endSession: false };
          }
        
        case 'awaiting_main_choice':
          return await USSDController.handleMainMenuChoice(lastInput, user, session);
        
        case 'view_bills':
        case 'bills_displayed':
          return await USSDController.handleBillsMenu(user, lastInput, session);
        
        case 'make_payment':
        case 'select_bill':
        case 'enter_amount':
        case 'confirm_payment':
          return await USSDController.handlePaymentFlow(user, lastInput, session);
        
        case 'file_complaint':
        case 'select_complaint_category':
        case 'enter_complaint_description':
          return await USSDController.handleComplaintFlow(user, lastInput, session);
        
        case 'view_profile':
          return { response: await USSDController.viewProfile(user), endSession: true };
        
        case 'contact_landlord':
          return { response: await USSDController.contactLandlord(user), endSession: true };
        
        case 'help_menu':
          return await USSDController.handleHelpMenu(user, lastInput, session);
        
        default:
          session.currentStep = 'main_menu';
          return { response: await USSDController.showMainMenu(user), endSession: false };
      }
    } catch (error) {
      console.error('Route Error:', error);
      return { 
        response: 'END An error occurred. Please try again later.', 
        endSession: true 
      };
    }
  }

  static async showMainMenu(user) {
    try {
      const pendingBills = await Bill.countDocuments({ 
        tenant: user._id, 
        status: { $in: ['Pending', 'Partial'] }
      });

      const totalOwed = await Bill.aggregate([
        { $match: { tenant: user._id, status: { $in: ['Pending', 'Partial'] } } },
        { $group: { _id: null, total: { $sum: '$remainingAmount' } } }
      ]);

      const amountOwed = totalOwed.length > 0 ? totalOwed[0].total : 0;

      let menu = `CON Welcome to SafeStay, ${user.name}!\n`;
      
      if (pendingBills > 0) {
        menu += `⚠ You have ${pendingBills} pending bill(s)\n`;
        menu += `💰 Total owed: KES ${amountOwed.toLocaleString()}\n`;
      } else {
        menu += `✓ All bills are up to date!\n`;
      }

      menu += `\n1. View Bills\n2. Make Payment\n3. File Complaint\n4. View Profile\n5. Contact Landlord\n6. Help\n0. Exit`;

      return menu;
    } catch (error) {
      console.error('Main Menu Error:', error);
      return 'CON Welcome to SafeStay!\n\n1. View Bills\n2. Make Payment\n3. File Complaint\n4. View Profile\n5. Contact Landlord\n6. Help\n0. Exit';
    }
  }

  static async handleMainMenuChoice(choice, user, session) {
    session.currentStep = 'awaiting_main_choice';
    
    switch (choice) {
      case '1':
        session.currentStep = 'view_bills';
        return await USSDController.handleBillsMenu(user, null, session);
      case '2':
        session.currentStep = 'make_payment';
        return await USSDController.handlePaymentFlow(user, null, session);
      case '3':
        session.currentStep = 'file_complaint';
        return await USSDController.handleComplaintFlow(user, null, session);
      case '4':
        return { response: await USSDController.viewProfile(user), endSession: true };
      case '5':
        return { response: await USSDController.contactLandlord(user), endSession: true };
      case '6':
        session.currentStep = 'help_menu';
        return await USSDController.handleHelpMenu(user, null, session);
      case '0':
        return { response: 'END Thank you for using SafeStay. Have a great day!', endSession: true };
      default:
        return { response: 'END Invalid option. Please dial again and select a valid option.', endSession: true };
    }
  }

  static async handleBillsMenu(user, input, session) {
    if (input === '0') {
      session.currentStep = 'main_menu';
      return { response: await USSDController.showMainMenu(user), endSession: false };
    }

    try {
      const bills = await Bill.find({ tenant: user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('landlord', 'name');

      if (bills.length === 0) {
        return { 
          response: USSDMenuService.buildEndMessage('No Bills', 'You have no bills at the moment.'),
          endSession: true 
        };
      }

      let response = 'CON Your Recent Bills:\n\n';
      bills.forEach((bill, index) => {
        const summary = USSDMenuService.formatBillSummary(bill);
        response += `${index + 1}. ${summary}\n`;
        
        if (bill.status !== 'Paid') {
          response += `   Due: ${USSDMenuService.formatDate(bill.dueDate)}\n`;
        }
        response += '\n';
      });

      response += '0. Back to Main Menu';
      session.currentStep = 'bills_displayed';
      return { response, endSession: false };

    } catch (error) {
      console.error('Error fetching bills:', error);
      return { response: 'END Error fetching bills. Please try again later.', endSession: true };
    }
  }

  static async handlePaymentFlow(user, input, session) {
    if (input === '0') {
      session.currentStep = 'main_menu';
      return { response: await USSDController.showMainMenu(user), endSession: false };
    }

    try {
      // Initialize payment flow
      if (!session.data.paymentStep) {
        const pendingBills = await Bill.find({ 
          tenant: user._id, 
          status: { $in: ['Pending', 'Partial'] }
        }).sort({ dueDate: 1 });

        if (pendingBills.length === 0) {
          return { 
            response: USSDMenuService.buildEndMessage('No Pending Bills', 'You have no pending bills to pay.'),
            endSession: true 
          };
        }

        let response = 'CON Select bill to pay:\n\n';
        pendingBills.forEach((bill, index) => {
          const amount = bill.remainingAmount || bill.amount;
          response += `${index + 1}. ${bill.month} ${bill.year}\n`;
          response += `   ${USSDMenuService.formatCurrency(amount)}\n`;
          
          const daysOverdue = USSDMenuService.calculateDaysOverdue(bill.dueDate);
          if (daysOverdue > 0) {
            response += `   (${daysOverdue} days overdue)\n`;
          }
          response += '\n';
        });
        response += '0. Back to Main Menu';
        
        session.data.pendingBills = pendingBills;
        session.data.paymentStep = 'select_bill';
        session.currentStep = 'select_bill';
        return { response, endSession: false };
      }

      // Handle bill selection
      if (session.data.paymentStep === 'select_bill') {
        const billIndex = parseInt(input) - 1;
        const pendingBills = session.data.pendingBills;
        
        if (billIndex >= 0 && billIndex < pendingBills.length) {
          const selectedBill = pendingBills[billIndex];
          session.data.selectedBill = selectedBill;
          session.data.paymentStep = 'enter_amount';
          session.currentStep = 'enter_amount';
          
          const outstanding = selectedBill.remainingAmount || selectedBill.amount;
          return { 
            response: `CON Payment for ${selectedBill.month} ${selectedBill.year}\nOutstanding: ${USSDMenuService.formatCurrency(outstanding)}\n\nEnter amount to pay:\n(Min: 100, Max: ${outstanding})`,
            endSession: false 
          };
        } else {
          return { response: 'END Invalid selection. Please try again.', endSession: true };
        }
      }

      // Handle amount entry
      if (session.data.paymentStep === 'enter_amount') {
        const amount = parseFloat(input);
        const selectedBill = session.data.selectedBill;
        const outstanding = selectedBill.remainingAmount || selectedBill.amount;
        
        if (!USSDMenuService.isValidAmount(input) || amount < 100) {
          return { response: 'END Invalid amount. Minimum payment is KSh 100.', endSession: true };
        }

        if (amount > outstanding) {
          return { response: 'END Amount exceeds outstanding balance.', endSession: true };
        }

        session.data.paymentAmount = amount;
        session.data.paymentStep = 'confirm_payment';
        session.currentStep = 'confirm_payment';
        
        return { 
          response: `CON Confirm Payment:\n\nBill: ${selectedBill.month} ${selectedBill.year}\nAmount: ${USSDMenuService.formatCurrency(amount)}\nNew Balance: ${USSDMenuService.formatCurrency(outstanding - amount)}\n\n1. Confirm\n2. Cancel`,
          endSession: false 
        };
      }

      // Handle payment confirmation
      if (session.data.paymentStep === 'confirm_payment') {
        if (input === '1') {
          // Initiate M-Pesa payment
          const result = await africasTalkingService.initiateMpesaPayment(
            user.primaryPhoneNumber,
            session.data.paymentAmount,
            session.data.selectedBill._id
          );

          if (result.success) {
            return { 
              response: USSDMenuService.buildEndMessage(
                'Payment Initiated',
                `Payment of ${USSDMenuService.formatCurrency(session.data.paymentAmount)} for ${session.data.selectedBill.month} ${session.data.selectedBill.year} has been initiated.\n\nYou will receive an M-Pesa prompt shortly. Please enter your PIN to complete the payment.`
              ),
              endSession: true 
            };
          } else {
            return { response: 'END Payment initiation failed. Please try again later.', endSession: true };
          }
        } else if (input === '2') {
          session.currentStep = 'main_menu';
          return { response: await USSDController.showMainMenu(user), endSession: false };
        } else {
          return { response: 'END Invalid option. Payment cancelled.', endSession: true };
        }
      }

    } catch (error) {
      console.error('Error in payment flow:', error);
      return { response: 'END Error processing payment. Please try again later.', endSession: true };
    }
  }

  static async handleComplaintFlow(user, input, session) {
    if (input === '0') {
      session.currentStep = 'main_menu';
      return { response: await USSDController.showMainMenu(user), endSession: false };
    }

    try {
      // Initialize complaint flow
      if (!session.data.complaintStep) {
        const categories = USSDMenuService.buildComplaintCategories();
        const response = USSDMenuService.buildMenu(
          'Select complaint category:',
          categories
        );
        
        session.data.complaintStep = 'select_category';
        session.data.complaintCategories = categories;
        session.currentStep = 'select_complaint_category';
        return { response, endSession: false };
      }

      // Handle category selection
      if (session.data.complaintStep === 'select_category') {
        const categoryIndex = parseInt(input) - 1;
        const categories = session.data.complaintCategories;
        
        if (categoryIndex >= 0 && categoryIndex < categories.length) {
          session.data.complaintCategory = categories[categoryIndex];
          session.data.complaintStep = 'enter_description';
          session.currentStep = 'enter_complaint_description';
          
          return { 
            response: `CON Enter complaint description for ${categories[categoryIndex]}:\n\n(Keep it brief but detailed)\n\nDescription:`,
            endSession: false 
          };
        } else {
          return { response: 'END Invalid category selection.', endSession: true };
        }
      }

      // Handle description entry
      if (session.data.complaintStep === 'enter_description') {
        const description = input.trim();
        
        if (description.length < 10) {
          return { response: 'END Description too short. Please provide more details (minimum 10 characters).', endSession: true };
        }

        if (description.length > 500) {
          return { response: 'END Description too long. Please keep it under 500 characters.', endSession: true };
        }

        // Create complaint
        const complaint = new Complaint({
          tenant: user._id,
          apartmentName: user.apartmentName,
          category: session.data.complaintCategory,
          description: description,
          status: 'Open',
          priority: 'Medium'
        });

        await complaint.save();

        // Send SMS notifications
        await africasTalkingService.sendComplaintAcknowledgment(user, complaint);

        // Notify landlord
        const landlord = await User.findOne({ 
          apartmentName: user.apartmentName, 
          role: 'Landlord' 
        });
        
        if (landlord) {
          await africasTalkingService.notifyLandlordOfComplaint(landlord, user, complaint);
        }

        return { 
          response: USSDMenuService.buildEndMessage(
            'Complaint Filed Successfully',
            `Category: ${session.data.complaintCategory}\n\nYour complaint has been forwarded to your landlord.\n\nReference: ${complaint._id.toString().substring(0, 8).toUpperCase()}\n\nYou will be contacted soon.`
          ),
          endSession: true 
        };
      }

    } catch (error) {
      console.error('Error in complaint flow:', error);
      return { response: 'END Error filing complaint. Please try again later.', endSession: true };
    }
  }

  static async viewProfile(user) {
    try {
      const bills = await Bill.aggregate([
        { $match: { tenant: user._id } },
        {
          $group: {
            _id: null,
            totalBills: { $sum: 1 },
            totalPaid: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] 
              }
            },
            totalOwed: { 
              $sum: { 
                $cond: [
                  { $in: ['$status', ['Pending', 'Partial']] }, 
                  '$remainingAmount', 
                  0
                ]
              }
            }
          }
        }
      ]);

      const stats = bills.length > 0 ? bills[0] : { totalBills: 0, totalPaid: 0, totalOwed: 0 };

      const content = `Name: ${user.name}
Apartment: ${user.apartmentName}
Phone: ${user.primaryPhoneNumber}
Role: ${user.role}
${user.dateMovedIn ? `Move-in Date: ${USSDMenuService.formatDate(user.dateMovedIn)}` : ''}

Bill Summary:
Total Bills: ${stats.totalBills}
Paid Bills: ${stats.totalPaid}
Outstanding: ${USSDMenuService.formatCurrency(stats.totalOwed || 0)}
${user.rentAmount ? `Monthly Rent: ${USSDMenuService.formatCurrency(user.rentAmount)}` : ''}`;

      return USSDMenuService.buildEndMessage('Your Profile', content);

    } catch (error) {
      console.error('Error fetching profile:', error);
      return 'END Error fetching profile. Please try again later.';
    }
  }

  static async contactLandlord(user) {
    try {
      const landlord = await User.findOne({ 
        apartmentName: user.apartmentName, 
        role: 'Landlord' 
      });

      if (!landlord) {
        return USSDMenuService.buildEndMessage(
          'Contact Information',
          'Landlord contact information not available.\n\nPlease contact SafeStay support:\nEmail: support@safestay.com\nPhone: +254-XXX-XXXXXX'
        );
      }

      const content = `Landlord Details:

Name: ${landlord.name}
Phone: ${landlord.primaryPhoneNumber}
${landlord.secondaryPhoneNumber ? `Alt Phone: ${landlord.secondaryPhoneNumber}` : ''}
Email: ${landlord.email}

Please contact your landlord directly for urgent matters.`;

      return USSDMenuService.buildEndMessage('Landlord Contact', content);

    } catch (error) {
      console.error('Error fetching landlord info:', error);
      return 'END Error fetching landlord information. Please try again later.';
    }
  }

  static async handleHelpMenu(user, input, session) {
    if (input === '0') {
      session.currentStep = 'main_menu';
      return { response: await USSDController.showMainMenu(user), endSession: false };
    }

    if (!input) {
      const helpOptions = [
        'How to Pay Bills',
        'Filing Complaints',
        'Understanding Your Rights',
        'Contact Support'
      ];
      
      const response = USSDMenuService.buildMenu('Help & Support', helpOptions);
      return { response, endSession: false };
    }

    switch (input) {
      case '1':
        return { 
          response: USSDMenuService.buildEndMessage(
            'How to Pay Bills',
            '1. Select "Make Payment" from main menu\n2. Choose the bill to pay\n3. Enter payment amount\n4. Confirm payment\n5. Complete M-Pesa transaction\n\nYou can make partial payments. Your landlord will be notified automatically.'
          ),
          endSession: true 
        };
      
      case '2':
        return { 
          response: USSDMenuService.buildEndMessage(
            'Filing Complaints',
            '1. Select "File Complaint" from main menu\n2. Choose complaint category\n3. Provide detailed description\n4. Submit complaint\n\nYour landlord will be notified immediately. You will receive a reference number for tracking.'
          ),
          endSession: true 
        };
      
      case '3':
        return { 
          response: USSDMenuService.buildEndMessage(
            'Your Tenant Rights',
            '• Right to peaceful enjoyment\n• 2-month notice before eviction\n• Safe and habitable living conditions\n• Privacy rights\n• Right to proper receipts\n\nFor legal advice, contact a tenant rights organization.'
          ),
          endSession: true 
        };
      
      case '4':
        return { 
          response: USSDMenuService.buildEndMessage(
            'Contact Support',
            'SafeStay Support:\n\nEmail: support@safestay.com\nPhone: +254-XXX-XXXXXX\nHours: Mon-Fri 8AM-6PM\n\nFor emergencies, contact your landlord directly.'
          ),
          endSession: true 
        };
      
      default:
        return { response: 'END Invalid option. Please try again.', endSession: true };
    }
  }
}

module.exports = USSDController;
