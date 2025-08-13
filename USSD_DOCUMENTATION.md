# SafeStay USSD Integration Guide

## Overview
SafeStay now includes USSD functionality that allows tenants to interact with the system using basic mobile phones via USSD codes. This feature provides access to essential services without requiring internet connectivity or smartphone apps.

## Features
- **Bill Management**: View bills, check payment status
- **Mobile Payments**: Initiate M-Pesa payments directly through USSD
- **Complaint Filing**: Submit maintenance and other complaints
- **Profile Information**: View personal and rental details
- **Landlord Contact**: Access landlord contact information
- **Help & Support**: Get guidance on using the system

## Technical Implementation

### 1. Environment Setup
Add these variables to your `.env` file:
```env
# Africa's Talking Configuration
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=your_api_key_here
USSD_CODE=*384*17140#
```

### 2. Database Models
- **UssdSession**: Tracks USSD sessions and user navigation state
- Enhanced User model with phone number fields
- Enhanced Bill model with payment history

### 3. API Endpoints

#### USSD Callback
- **POST** `/api/ussd/callback`
- Handles incoming USSD requests from Africa's Talking
- Processes user input and returns appropriate responses

#### USSD Testing
- **POST** `/api/ussd/test`
- Simulates USSD requests for testing purposes
- Body: `{ phoneNumber, text }`

#### Payment Webhooks
- **POST** `/api/payments/mpesa/notification`
- Receives M-Pesa payment notifications
- **GET** `/api/payments/status/:transactionId`
- Query payment status
- **POST** `/api/payments/manual`
- Record manual payments (landlord only)

### 4. USSD Menu Structure

```
Main Menu
├── 1. View Bills
│   └── Shows recent bills with status and amounts
├── 2. Make Payment
│   ├── Select bill to pay
│   ├── Enter payment amount
│   └── Confirm M-Pesa payment
├── 3. File Complaint
│   ├── Select complaint category
│   └── Enter description
├── 4. View Profile
│   └── Display user and rental information
├── 5. Contact Landlord
│   └── Show landlord contact details
├── 6. Help
│   ├── How to Pay Bills
│   ├── Filing Complaints
│   ├── Understanding Your Rights
│   └── Contact Support
└── 0. Exit
```

## Setup Instructions

### 1. Install Dependencies
```bash
# Already included in package.json
npm install africastalking
```

### 2. Configure Africa's Talking
1. Sign up at [Africa's Talking](https://africastalking.com)
2. Create a new app and note your username and API key
3. Set up a USSD service code
4. Configure webhook URL: `https://yourdomain.com/api/ussd/callback`

### 3. Update Environment Variables
```env
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_live_api_key
USSD_CODE=*384*17140#  # Your assigned USSD code
```

### 4. Deploy and Test
1. Deploy your application to a public server
2. Configure webhook URLs in Africa's Talking dashboard
3. Test with registered phone numbers

## Testing

### Local Testing
```bash
# Run the test script
node scripts/testUSSD.js
```

### Manual Testing
```bash
# Test USSD endpoint directly
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254700000000",
    "text": ""
  }'
```

## User Registration Requirements

For USSD to work, users must be registered in the system with:
- Valid phone number (primaryPhoneNumber or secondaryPhoneNumber)
- Associated apartment and landlord
- Proper role assignment (Tenant/Landlord)

## Security Considerations

1. **Phone Number Validation**: All phone numbers are normalized and validated
2. **Session Management**: USSD sessions expire after 5 minutes
3. **Input Sanitization**: All user inputs are validated and sanitized
4. **Rate Limiting**: Consider implementing rate limiting for USSD endpoints
5. **Webhook Security**: Validate incoming webhook signatures from Africa's Talking

## Monitoring and Logging

The system logs:
- All USSD interactions
- Payment notifications
- Error events
- User session data

Monitor these logs for:
- Failed payment attempts
- System errors
- Unusual usage patterns
- Security incidents

## Troubleshooting

### Common Issues

1. **"Phone number not registered" error**
   - Ensure user exists in database with correct phone number
   - Check phone number format (international format recommended)

2. **USSD sessions not working**
   - Verify webhook URL is accessible from internet
   - Check Africa's Talking configuration
   - Ensure MongoDB connection is stable

3. **Payment notifications not received**
   - Verify payment webhook URL
   - Check Africa's Talking payment configuration
   - Review payment notification logs

4. **SMS notifications not sending**
   - Check Africa's Talking SMS balance
   - Verify SMS sender ID configuration
   - Review API credentials

### Debug Mode
Set environment variable `DEBUG=true` to enable detailed logging:
```env
DEBUG=true
```

## Future Enhancements

1. **Multi-language Support**: Add support for local languages
2. **Advanced Payment Options**: Bank transfers, other mobile money services
3. **Rental Reminders**: Automated rent reminders via SMS
4. **Maintenance Scheduling**: Allow scheduling of maintenance visits
5. **Receipt Generation**: Generate and send payment receipts via SMS
6. **Bulk Operations**: Handle multiple bills/payments in one session

## API Reference

### USSD Request Format
```json
{
  "sessionId": "ATUid_unique_session_id",
  "serviceCode": "*384*17140#",
  "phoneNumber": "+254700000000",
  "text": "1*2*5000"
}
```

### USSD Response Format
```
CON Welcome to SafeStay!
1. View Bills
2. Make Payment
0. Exit
```

### Payment Notification Format
```json
{
  "transactionId": "AT_TXN_12345",
  "phoneNumber": "+254700000000",
  "amount": "5000.00",
  "status": "Success",
  "metadata": {
    "billId": "bill_id_here",
    "service": "rent_payment"
  }
}
```

## Support

For technical support or questions about the USSD integration:
- Email: tech-support@safestay.com
- Documentation: [Link to full documentation]
- Africa's Talking Support: [Africa's Talking Documentation](https://developers.africastalking.com/)

---

*Last Updated: August 2025*
