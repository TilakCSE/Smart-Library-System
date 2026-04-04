import axios from "axios";

// This guarantees that even if Vercel drops the environment variable, 
// your frontend knows EXACTLY where your Render backend lives.
const API_URL = import.meta.env.VITE_API_URL || "https://smart-library-api-aw9d.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Important: Gives Render time to wake up from cold start!
});

export default api;