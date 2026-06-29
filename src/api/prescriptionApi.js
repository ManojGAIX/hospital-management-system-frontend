import api from "./axiosConfig";

const API = "http://localhost:8080/api/prescriptions";

export const getPrescriptions = () => api.get(API);

export const createPrescription = (data) =>
  api.post(API, data);

export const updatePrescription = (id, data) =>
  api.put(`${API}/${id}`, data);

export const deletePrescription = (id) =>
  api.delete(`${API}/${id}`);