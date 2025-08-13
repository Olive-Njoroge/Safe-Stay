const axios = require('axios');

// USSD Testing Script
class USSDTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.sessionId = `test_${Date.now()}`;
  }

  async testUSSDFlow(phoneNumber, steps) {
    console.log(`\n🧪 Testing USSD flow for ${phoneNumber}`);
    console.log('=' .repeat(50));

    let text = '';
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        console.log(`\nStep ${i + 1}: ${step.description}`);
        console.log(`Input: "${step.input}"`);
        
        if (step.input) {
          text = text ? `${text}*${step.input}` : step.input;
        }

        const response = await axios.post(`${this.baseURL}/api/ussd/test`, {
          phoneNumber,
          text
        });

        console.log(`Response: ${response.data.response}`);
        console.log(`Type: ${response.data.type}`);
        
        if (response.data.type === 'end') {
          console.log('🔚 Session ended');
          break;
        }

      } catch (error) {
        console.error(`❌ Error in step ${i + 1}:`, error.response?.data || error.message);
        break;
      }
    }
  }

  // Test main menu
  async testMainMenu() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' }
    ]);
  }

  // Test bill viewing
  async testViewBills() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' },
      { description: 'Select View Bills', input: '1' }
    ]);
  }

  // Test payment flow
  async testPaymentFlow() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' },
      { description: 'Select Make Payment', input: '2' },
      { description: 'Select first bill', input: '1' },
      { description: 'Enter payment amount', input: '5000' },
      { description: 'Confirm payment', input: '1' }
    ]);
  }

  // Test complaint filing
  async testComplaintFlow() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' },
      { description: 'Select File Complaint', input: '3' },
      { description: 'Select Maintenance Issue', input: '1' },
      { description: 'Enter description', input: 'Water heater not working properly for the past 3 days' }
    ]);
  }

  // Test profile view
  async testProfileView() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' },
      { description: 'Select View Profile', input: '4' }
    ]);
  }

  // Test help menu
  async testHelpMenu() {
    await this.testUSSDFlow('+254700000000', [
      { description: 'Initial USSD dial', input: '' },
      { description: 'Select Help', input: '6' },
      { description: 'Select How to Pay Bills', input: '1' }
    ]);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting USSD Integration Tests');
    console.log('=' .repeat(60));

    try {
      await this.testMainMenu();
      await this.testViewBills();
      await this.testPaymentFlow();
      await this.testComplaintFlow();
      await this.testProfileView();
      await this.testHelpMenu();
      
      console.log('\n✅ All tests completed');
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new USSDTester();
  tester.runAllTests();
}

module.exports = USSDTester;
