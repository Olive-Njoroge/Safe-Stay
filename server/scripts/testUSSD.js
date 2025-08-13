const axios = require('axios');

// USSD Testing Script
class USSDTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.sessionId = `test_${Date.now()}`;
  }

  async testUSSDFlow(phoneNumber, steps) {
    console.log(`\n🧪 Testing USSD flow for ${phoneNumber}`);
    console.log('USSD Code: *384*70943#');
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
    console.log('\n📱 Testing Main Menu Access');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943# (Initial USSD dial)', input: '' }
    ]);
  }

  // Test bill viewing
  async testViewBills() {
    console.log('\n💰 Testing Bill Viewing');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943#', input: '' },
      { description: 'Select View Bills', input: '1' }
    ]);
  }

  // Test payment flow
  async testPaymentFlow() {
    console.log('\n💳 Testing Payment Flow');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943#', input: '' },
      { description: 'Select Make Payment', input: '2' },
      { description: 'Select first bill', input: '1' },
      { description: 'Enter payment amount', input: '5000' },
      { description: 'Confirm payment', input: '1' }
    ]);
  }

  // Test complaint filing
  async testComplaintFlow() {
    console.log('\n📝 Testing Complaint Filing');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943#', input: '' },
      { description: 'Select File Complaint', input: '3' },
      { description: 'Select Maintenance Issue', input: '1' },
      { description: 'Enter description', input: 'Water heater not working properly for the past 3 days' }
    ]);
  }

  // Test profile view
  async testProfileView() {
    console.log('\n👤 Testing Profile View');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943#', input: '' },
      { description: 'Select View Profile', input: '4' }
    ]);
  }

  // Test help menu
  async testHelpMenu() {
    console.log('\n❓ Testing Help Menu');
    await this.testUSSDFlow('+254711123456', [
      { description: 'Dial *384*70943#', input: '' },
      { description: 'Select Help', input: '6' },
      { description: 'Select How to Pay Bills', input: '1' }
    ]);
  }

  // Test with unregistered number
  async testUnregisteredUser() {
    console.log('\n🚫 Testing Unregistered User');
    await this.testUSSDFlow('+254799999999', [
      { description: 'Dial *384*70943# with unregistered number', input: '' }
    ]);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting SafeStay USSD Integration Tests');
    console.log('USSD Code: *384*70943#');
    console.log('=' .repeat(60));

    try {
      await this.testMainMenu();
      await this.testViewBills();
      await this.testPaymentFlow();
      await this.testComplaintFlow();
      await this.testProfileView();
      await this.testHelpMenu();
      await this.testUnregisteredUser();
      
      console.log('\n✅ All tests completed');
      console.log('\n📋 Test Summary:');
      console.log('- Main menu navigation: Tested');
      console.log('- Bill viewing: Tested');
      console.log('- Payment initiation: Tested');
      console.log('- Complaint filing: Tested');
      console.log('- Profile access: Tested');
      console.log('- Help system: Tested');
      console.log('- Error handling: Tested');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  // Test specific scenario
  async testScenario(scenarioName) {
    switch (scenarioName) {
      case 'menu':
        await this.testMainMenu();
        break;
      case 'bills':
        await this.testViewBills();
        break;
      case 'payment':
        await this.testPaymentFlow();
        break;
      case 'complaint':
        await this.testComplaintFlow();
        break;
      case 'profile':
        await this.testProfileView();
        break;
      case 'help':
        await this.testHelpMenu();
        break;
      case 'unregistered':
        await this.testUnregisteredUser();
        break;
      default:
        console.log('Available scenarios: menu, bills, payment, complaint, profile, help, unregistered');
    }
  }
}

// Command line interface
if (require.main === module) {
  const tester = new USSDTester();
  const scenario = process.argv[2];
  
  if (scenario) {
    tester.testScenario(scenario);
  } else {
    tester.runAllTests();
  }
}

module.exports = USSDTester;
