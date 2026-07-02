import api from "../services/api";

const API = "/api/pharmacy";

export const savePharmacyBill = (data) =>
  api.post(`${API}/save`, data);

export const getPharmacyHistory = () =>
  api.get(`${API}/history`);