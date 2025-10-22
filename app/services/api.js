import axios from "axios";
const API_URL = "http://localhost:5000/api";
export default {
  post: (path, data) => axios.post(`${API_URL}${path}`, data),
  get: (path) => axios.get(`${API_URL}${path}`)
};
