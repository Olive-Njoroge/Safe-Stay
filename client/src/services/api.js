import axios from 'axios';
import io from 'socket.io-client';

// Base URL configuration
const backendBaseUrl = "https://safe-stay-backend.onrender.com";
const API_BaseUrl = `${backendBaseUrl}/api`;

// Axios instance with robust error handling
const API = axios.create({
  baseURL: API_BaseUrl,
  timeout: 60000, // 60 seconds for cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry function for failed requests
const retryRequest = async (fn, retries = 3, delay = 2000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || error.response?.status >= 500)) {
      console.log(`Retrying request... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

// Request interceptor with caching
const requestCache = new Map();
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add request caching for GET requests
  if (config.method === 'get') {
    const cacheKey = `${config.url}_${JSON.stringify(config.params)}`;
    const cachedResponse = requestCache.get(cacheKey);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < 60000) { // 1 minute cache
      return Promise.resolve(cachedResponse.data);
    }
  }
  
  return config;
}, (error) => Promise.reject(error));

// ✅ Response interceptor for better error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - backend might be sleeping');
      // You can show a user-friendly message here
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check connection');
      // You can show a user-friendly message here
    }
    
    // Handle common error cases
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

// ✅ Wake up backend function (for Render free tier)
export const wakeUpBackend = async () => {
  try {
    await retryRequest(() => API.get('/health'), 5, 3000); // Extra retries for wake up
    console.log('Backend is awake');
  } catch (error) {
    console.error('Failed to wake up backend:', error);
  }
};

// ✅ Auth APIs with retry
export const registerUser = (userData) => retryRequest(() => API.post("/auth/register", userData));
export const loginUser = (userData) => retryRequest(() => API.post("/auth/login", userData));

// ✅ User APIs
export const getUserProfile = () => API.get("/users/profile");
export const getAllTenants = () => API.get("/users/tenants");
export const getAllLandlords = () => API.get("/users/landlords");
export const updateRentAmount = (rentData) => API.put("/users/rent-amount", rentData);
export const getAllUsers = () => API.get("/users/all"); // Debug endpoint

// ✅ Bills APIs
export const getBills = () => API.get("/bills/me");
export const createBill = (billData) => API.post("/bills", billData);
export const createMonthlyBill = (billData) => API.post("/bills/generate-monthly", billData);
export const cashPayment = (billId) => API.post(`/bills/pay-cash/${billId}`);
export const getMyBills = () => API.get("/bills/me");
export const getBillsForApartment = () => API.get("/bills/apartment");
export const generateMonthlyBills = (billData) => API.post("/bills/generate-monthly", billData);
export const makeCashPayment = (paymentData) => API.post("/bills/pay-cash", paymentData);
export const updateBill = (billId, billData) => API.put(`/bills/${billId}`, billData);
export const getUnpaidBills = () => API.get("/bills/unpaid");
export const getPaidBills = () => API.get("/bills/paid");
export const downloadBillPDF = (billId) => API.get(`/bills/download/${billId}`, { responseType: 'blob' });
export const downloadReceiptPDF = (billId) => API.get(`/bills/download-receipt/${billId}`, { responseType: 'blob' });
export const downloadPaymentReceiptPDF = (billId, paymentIndex) => API.get(`/bills/download-receipt/${billId}/${paymentIndex}`, { responseType: 'blob' });

// ✅ Complaints APIs
export const getComplaints = () => API.get("/complaints");
export const getMyComplaints = () => API.get("/complaints/me");
export const createComplaint = (complaintData) => API.post("/complaints", complaintData);
export const updateComplaint = (complaintId, statusData) => API.put(`/complaints/${complaintId}`, statusData);
export const updateComplaintStatus = (complaintId, statusData) => API.put(`/complaints/${complaintId}`, statusData);
export const addLandlordNote = (complaintId, note) => API.post(`/complaints/${complaintId}/note`, { note });

// ✅ Chat APIs
export const getMyConversations = () => API.get("/chats/conversations");
export const getAvailableChatPartners = () => API.get("/chats/partners");
export const getConversation = (currentUserId, partnerId) => API.get(`/chats/conversation/${currentUserId}/${partnerId}`);
export const createChat = (messageData) => API.post("/chats", messageData);
export const getChatsByNationalID = (nationalID) => API.get(`/chats/user/${nationalID}`);
export const debugUsers = () => API.get("/chats/debug/users");

// ✅ Rules APIs
export const getRules = () => API.get("/rules");
export const addRule = (rulesData) => API.post("/rules", rulesData);
export const addRules = (rulesData) => API.post("/rules", rulesData);
export const updateRule = (ruleId, ruleData) => API.put(`/rules/${ruleId}`, ruleData);
export const deleteRule = (ruleId) => API.delete(`/rules/${ruleId}`);

// ✅ Apartments APIs
export const getAvailableApartments = () => retryRequest(() => API.get(`/apartments/available?t=${Date.now()}`));
export const createApartment = (apartmentData) => API.post("/apartments", apartmentData);
export const getLandlordApartments = () => API.get("/apartments/landlord/my-apartments");
export const updateApartment = (apartmentId, apartmentData) => API.put(`/apartments/${apartmentId}`, apartmentData);
export const deleteApartment = (apartmentId) => API.delete(`/apartments/${apartmentId}`);
export const getApartmentById = (apartmentId) => API.get(`/apartments/${apartmentId}`);

// ✅ Socket.io client
export const socket = io(backendBaseUrl, { autoConnect: false });

// ✅ Helper function to get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ✅ Helper function to logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  socket.disconnect();
};
