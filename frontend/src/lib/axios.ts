import axios from "axios";

const getBaseURL = (): string => {
  // Read exactly what is in the browser's URL bar right now.
  // If you are running the frontend on your local machine, use local backend.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:8000";
  }
  
  // If you are anywhere else on the internet (Vercel), forcefully use Render.
  return "https://smart-library-api-aw9d.onrender.com";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;