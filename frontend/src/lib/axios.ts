import axios from "axios";

// This is the function that went missing during the merge!
const getBaseURL = (): string => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:8000"; // Local FastAPI
  }
  return "https://smart-library-api-aw9d.onrender.com"; // Production FastAPI
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;