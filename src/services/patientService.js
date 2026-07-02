import api from "./api";

/**
 * Get all patients
 */
export const getPatients = async () => {
  return await api.get("/api/patients");
};

/**
 * Get patient by Id
 */
export const getPatientById = async (id) => {
  return await api.get(`/api/patients/${id}`);
};

/**
 * Create new patient
 */
export const createPatient = async (patient) => {
  return await api.post("/api/patients", patient);
};

/**
 * Update patient
 */
export const updatePatient = async (id, patient) => {
  return await api.put(`/api/patients/${id}`, patient);
};

/**
 * Delete patient
 */
export const deletePatient = async (id) => {
  return await api.delete(`/api/patients/${id}`);
};