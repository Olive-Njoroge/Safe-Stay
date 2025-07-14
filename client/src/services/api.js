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
