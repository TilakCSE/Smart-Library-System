import axios from "axios";

const getBaseURL = (): string => {
  // Read exactly what is in the browser's URL bar right now.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:8000"; // FORCE LOCAL BACKEND
  }
  
  return "https://smart-library-api-aw9d.onrender.com"; // PRODUCTION
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;