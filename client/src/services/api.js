import axios from 'axios';
import io from 'socket.io-client';

// Base URLs
const backendBaseUrl = "http://localhost:5000";
const API_BaseUrl = `${backendBaseUrl}/api`;

// Axios instance
const API = axios.create({
  baseURL: API_BaseUrl,
});

// ✅ Attach token to every request if available
API.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const token = JSON.parse(user).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


// ✅ Auth
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);

// ✅ Rooms
export const getRooms = () => API.get("/rooms");
export const createRoom = (name) => API.post("/rooms", { name });

// ✅ Messages
export const getMessages = (roomId) => API.get(`/messages/${roomId}`);

// ✅ Socket.io client
export const socket = io(backendBaseUrl, { autoConnect: false });

// ✅ Bills API

// Landlord: Generate a new bill
export const generateBill = (billData) => API.post("/bills/generate", billData);

// Tenant: Get bills for the currently logged-in user
export const getMyBills = () => API.get("/bills/me");

// Landlord: Get all bills
export const getAllBills = () => API.get("/bills");

// Landlord: Get bills for a specific tenant
export const getBillsByTenant = (tenantId) => API.get(`/bills/${tenantId}`);

// Landlord: Mark a bill as paid
export const markBillAsPaid = (billId, paymentData) =>
  API.put(`/bills/${billId}/pay`, paymentData);

