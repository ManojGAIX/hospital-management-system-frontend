import api from "./axiosConfig";

const API = "http://localhost:8080/api/pharmacy";

export const savePharmacyBill = (data) =>
  api.post(`${API}/save`, data);

export const getPharmacyHistory = () =>
  api.get(`${API}/history`);