# 🛠 Tech Stack & Tools

---

## **Frontend:**
- **React.js** — Main framework for building the user interface
- **Tailwind CSS** — For fast, responsive styling *(or Bootstrap/Material UI if you prefer)*
- **React Router** — For page navigation
- **Axios** — For making HTTP requests to backend APIs

---

## **Backend:**
- **Node.js + Express.js** — For building the backend API
- **Socket.IO** — For real-time chat between tenants and landlords
- **jsonwebtoken (JWT)** — For authentication & session management
- **bcryptjs** — For password hashing

---

## **Database:**
- **MongoDB + Mongoose (NoSQL)** — To store:
  - Users (tenants, landlords)
  - Chat messages
  - Complaints
  - Bills & Payments
  - Receipts
  - Landlord rules
- *(Optional)*: **Firebase Firestore** — For faster prototyping (if you want to avoid backend complexity)

---

## **Payments & Receipts:**
- **M-Pesa Daraja API** — For mobile money payments (local)
- **PayPal REST API** — For international payments *(optional)*
- **jsPDF** or **html2pdf.js** — For generating PDF receipts
- **Cloudinary** or local storage — For storing uploaded receipts or images *(optional)*

---

## **Authentication & Authorization:**
- **JWT (jsonwebtoken)** — For secure login sessions
- **Role-based access control (RBAC)** — To separate tenant vs. landlord vs. caretaker views

---

## **Notifications:**
- **EmailJS** *(Frontend-only email sending)* or **Nodemailer** *(if using backend)* — For sending receipts, updates, etc.
- *(Optional future feature)*: **Twilio** or **Africa’s Talking** — For SMS reminders

---

## **Deployment:**
- **Frontend:** Netlify / Vercel
- **Backend:** Render / Railway / Cyclic *(free Node.js hosting)*
- **Database:** MongoDB Atlas *(free tier)*

---

## **Optional/Stretch Tools:**
- **Figma** or **Canva** — For UI/UX design mockups
- **Postman** — For testing APIs
- **Trello** or **Notion** — For task tracking

---

## ✅ **Summary Breakdown Example (matching your features):**

| Feature                        | Tools/Tech                                |
|---------------------------------|-------------------------------------------|
| **Chatbox**                     | Socket.IO, Node.js, MongoDB               |
| **Authentication**              | JWT, bcryptjs                             |
| **Payment Integration**         | M-Pesa Daraja API, PayPal, jsPDF for receipts |
| **Tenant Rights & Landlord Rules** | React, Tailwind (static or dynamic pages) |
| **Complaint Section**           | React, Node.js, MongoDB                   |
| **Tenant & Landlord Profiles**  | MongoDB, React                            |

