import api from "./axiosConfig";

const API = "http://localhost:8080/api/bills";

export const getBills = () => api.get(API);

export const createBill = (bill) =>
  api.post(API, bill);

export const deleteBill = (id) =>
  api.delete(`${API}/${id}`);