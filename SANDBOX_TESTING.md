# SafeStay USSD Local Testing Guide

## Setup ngrok for Local Testing

### 1. Install ngrok
```bash
# Download from https://ngrok.com/download
# Or install via npm
npm install -g ngrok
```

### 2. Start your SafeStay server
```bash
cd server
npm run dev
```

### 3. In another terminal, expose your local server
```bash
ngrok http 5000
```

### 4. Note the ngrok URLs
```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

### 5. Configure Webhooks in Africa's Talking Sandbox
- USSD Callback URL: `https://abc123.ngrok.io/api/ussd/callback`
- SMS Delivery Reports: `https://abc123.ngrok.io/api/sms/delivery-reports`
- Payment Notifications: `https://abc123.ngrok.io/api/payments/mpesa/notification`

## Testing USSD Locally

### 1. Test via API endpoint
```bash
curl -X POST http://localhost:5000/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254711123456",
    "text": ""
  }'
```

### 2. Test complete USSD flow
```bash
# Main menu
curl -X POST http://localhost:5000/api/ussd/test -H "Content-Type: application/json" -d '{"phoneNumber": "+254711123456", "text": ""}'

# Select option 1 (View Bills)
curl -X POST http://localhost:5000/api/ussd/test -H "Content-Type: application/json" -d '{"phoneNumber": "+254711123456", "text": "1"}'

# Select option 2 (Make Payment)
curl -X POST http://localhost:5000/api/ussd/test -H "Content-Type: application/json" -d '{"phoneNumber": "+254711123456", "text": "2"}'
```

## Sandbox Limitations

### What Works:
- ✅ USSD session simulation
- ✅ SMS to verified numbers
- ✅ Payment flow simulation
- ✅ Webhook testing

### What Doesn't Work:
- ❌ Real USSD short codes (use test endpoints)
- ❌ SMS to unverified numbers
- ❌ Real money transactions
- ❌ Production webhook URLs

## Sample Test Data

Create test users in your database with these phone numbers:
```javascript
// Test tenant
{
  name: "John Doe",
  email: "john@test.com",
  primaryPhoneNumber: "254711123456",
  role: "Tenant",
  apartmentName: "Test Apartment A",
  // ... other fields
}

// Test landlord
{
  name: "Jane Smith", 
  email: "jane@test.com",
  primaryPhoneNumber: "254722123456",
  role: "Landlord",
  apartmentName: "Test Apartment A",
  // ... other fields
}
```

## Next Steps After Sandbox Testing

1. ✅ Verify all USSD flows work
2. ✅ Test SMS notifications
3. ✅ Test payment simulations
4. ✅ Handle error scenarios
5. 🚀 Apply for production USSD short code
6. 🚀 Deploy to production server
7. 🚀 Switch to live API credentials
