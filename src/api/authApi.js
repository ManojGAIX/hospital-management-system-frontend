import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/auth";

export const loginUser = async (data) => {
  return api.post(`${API_URL}/login`, data);
};