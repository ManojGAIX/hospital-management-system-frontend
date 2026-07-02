import api from "../services/api";

const API_URL = "/api/auth";

export const loginUser = async (data) => {
  return api.post(`${API_URL}/login`, data);
};