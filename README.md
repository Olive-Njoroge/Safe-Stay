# SafeStay 🏡

**SafeStay** is a full-stack home rental management system built to simplify property management, tenant communication, billing, and legal awareness. This application enables landlords and tenants to interact seamlessly, maintain accurate records, and foster transparency in the rental process.

---

## 🎥 Project Demo

[▶️ Watch Safe Stay Demo Video](https://drive.google.com/file/d/1HT8Gbsf-zI5hgNSRvPKd4v7IQjUYf-22/view)

This walkthrough highlights the main features of **SafeStay**, including user authentication, tenant management, billing, legal awareness, and overall app flow — all explained with a clear voiceover.

---

## 🌟 Features

### 🔑 Authentication
- Tenant and landlord login & registration
- Role-based dashboard access

### 🧾 Billing & Payments
- Generate, view, and manage monthly bills
- Mark bills as paid
- Generate receipts
- Automatically update due dates

### 📋 Tenant Management
- Register new tenants
- View tenant profiles and balances
- Track rent history and pending payments

### 📌 Legal Awareness
- Educates tenants on their rights (e.g., two-month notice before eviction)
- Helps landlords ensure compliance with rental laws

### 📬 Notifications
- (Planned) Email or SMS alerts for new bills and approaching due dates

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios (for API requests)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### DevOps / Deployment
- Render and Vercel
- GitHub for version control

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/safestay.git
cd safestay
````

### 2. Install dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

### 3. Set environment variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the app

#### Backend

```bash
cd server
npm run dev
```

#### Frontend

```bash
cd client
npm start
```

---

## 📸 Screenshots
![Login Page](assets/login.png)
