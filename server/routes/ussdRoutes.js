const express = require('express');
const USSDController = require('../controllers/ussdController');

const router = express.Router();

// USSD callback endpoint - Direct route for Africa's Talking
router.post('/', USSDController.handleUSSD);

// Alternative callback endpoint
router.post('/callback', USSDController.handleUSSD);

// Test endpoint to simulate USSD request
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, text } = req.body;
    
    // Simulate USSD request
    const mockRequest = {
      body: {
        sessionId: `test_${Date.now()}`,
        serviceCode: '*384*17140#',
        phoneNumber: phoneNumber || '+254700000000',
        text: text || ''
      }
    };

    const mockResponse = {
      set: (header, value) => {
        console.log(`Header: ${header}, Value: ${value}`);
      },
      send: (response) => {
        res.json({ 
          success: true, 
          response: response,
          type: response.startsWith('CON') ? 'continue' : 'end'
        });
      }
    };

    await USSDController.handleUSSD(mockRequest, mockResponse);

  } catch (error) {
    console.error('USSD Test Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error testing USSD' 
    });
  }
});

module.exports = router;
