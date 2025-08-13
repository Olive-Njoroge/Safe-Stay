# SafeStay Render Deployment Guide

## Prerequisites
- GitHub repository (you already have this)
- Render account (free tier available)
- MongoDB Atlas database (you already have this)
- Africa's Talking sandbox account (you already have this)

## Step 1: Prepare Your Repository

### 1.1 Create .gitignore (if not exists)
Make sure your `.env` file is not committed to GitHub:

```gitignore
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/
client/node_modules/
server/node_modules/

# Build outputs
client/dist/
client/build/

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed

# IDE files
.vscode/
.idea/
*.swp
*.swo
```

### 1.2 Update package.json for production
Ensure your server/package.json has the correct start script:

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

## Step 2: Deploy to Render

### 2.1 Create Web Service
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Safe-Stay`
4. Configure the service:

**Basic Settings:**
- Name: `safestay-api`
- Root Directory: `server`
- Environment: `Node`
- Region: Choose closest to your users (e.g., Frankfurt for Kenya)
- Branch: `main`

**Build & Deploy:**
- Build Command: `npm install`
- Start Command: `npm start`

### 2.2 Environment Variables
Add these environment variables in Render dashboard:

```
MONGO_URI=mongodb+srv://Olive:safestaydb@cluster0.dhp9m3h.mongodb.net/Olive?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=mySecretKey123
PORT=10000
AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_API_KEY=atsk_20d52270ffa6e8340b455598465e9ff95bc43b41f32ca9d502cf8120a8c2067ea39124c5
USSD_CODE=*384*17140#
NODE_ENV=production
```

**Important Notes:**
- Render uses PORT=10000 by default
- Don't include quotes around values
- Keep your API key secure

## Step 3: Configure Africa's Talking Webhooks

Once deployed, your Render URL will be something like:
`https://safestay-api.onrender.com`

### 3.1 Update Webhook URLs in Africa's Talking
1. Login to [sandbox.africastalking.com](https://sandbox.africastalking.com)
2. Go to **USSD** → **Settings**
3. Set Callback URL: `https://safestay-api.onrender.com/api/ussd/callback`

### 3.2 Configure SMS Webhooks (Optional)
- Delivery Reports: `https://safestay-api.onrender.com/api/sms/delivery-reports`

### 3.3 Configure Payment Webhooks
- M-Pesa Notifications: `https://safestay-api.onrender.com/api/payments/mpesa/notification`

## Step 4: Test Your Deployment

### 4.1 Health Check
Visit: `https://safestay-api.onrender.com`
Should return: "Home Management Backend Running"

### 4.2 Test USSD Endpoint
```bash
curl -X POST https://safestay-api.onrender.com/api/ussd/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+254711123456",
    "text": ""
  }'
```

### 4.3 Create Test Data
```bash
curl -X POST https://safestay-api.onrender.com/api/test/setup-data \
  -H "Content-Type: application/json"
```

## Step 5: Render-Specific Considerations

### 5.1 Free Tier Limitations
- Apps sleep after 15 minutes of inactivity
- 750 hours/month of runtime
- Shared CPU and memory
- No custom domains (upgrade for this)

### 5.2 Keep App Awake (Optional)
Create a simple uptime monitor:

```javascript
// Add to your server/index.js
if (process.env.NODE_ENV === 'production') {
  // Ping self every 14 minutes to prevent sleeping
  setInterval(() => {
    fetch(`${process.env.BASE_URL || 'https://safestay-api.onrender.com'}/`)
      .catch(console.error);
  }, 14 * 60 * 1000);
}
```

### 5.3 Database Connections
Your MongoDB Atlas connection should work fine. Make sure to:
- Whitelist Render's IP addresses (or use 0.0.0.0/0 for development)
- Use connection pooling for better performance

## Step 6: Monitoring and Logs

### 6.1 View Logs
In Render dashboard:
- Go to your service
- Click "Logs" tab
- Monitor for errors and USSD requests

### 6.2 Set Up Alerts
- Configure email notifications for deploy failures
- Monitor uptime and response times

## Step 7: Going to Production

### 7.1 Custom Domain (Paid Plan)
- Add custom domain in Render
- Update DNS records
- SSL automatically provided

### 7.2 Upgrade from Sandbox
When ready for production:
1. Apply for live USSD short code from Africa's Talking
2. Switch to live API credentials
3. Update webhook URLs to production domain
4. Complete KYC verification

## Troubleshooting

### Common Issues:

1. **App not starting**
   - Check logs for missing dependencies
   - Verify environment variables
   - Ensure correct start command

2. **Database connection fails**
   - Verify MONGO_URI
   - Check MongoDB Atlas network access
   - Confirm database user permissions

3. **USSD webhooks not working**
   - Verify webhook URL is publicly accessible
   - Check Render logs for incoming requests
   - Confirm Africa's Talking webhook configuration

4. **App sleeping (free tier)**
   - Implement keep-alive pings
   - Consider upgrading to paid plan
   - Use external uptime monitoring

## Next Steps

1. Deploy to Render
2. Configure webhooks
3. Test USSD functionality
4. Set up monitoring
5. Plan for production migration
