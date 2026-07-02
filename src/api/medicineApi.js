import api from "../services/api";

const API = "/api/medicines";

export const getMedicines = () => api.get(API);

export const createMedicine = (medicine) =>
  api.post(API, medicine);

export const updateMedicine = (id, medicine) =>
  api.put(`${API}/${id}`, medicine);

export const deleteMedicine = (id) =>
  api.delete(`${API}/${id}`);

export const getLowStockMedicines = () =>
  api.get(`${API}/low-stock`);