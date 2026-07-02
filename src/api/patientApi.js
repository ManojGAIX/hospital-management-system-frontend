import api from "../services/api";

const API_URL ="/api/patients";

// GET ALL
// patientApi.js
export const getPatients = async () => {
  return await api.get("/api/patients");
};

// GET BY ID
export const getPatientById = (id) => {
    return api.get(`${API_URL}/${id}`);
};

// CREATE
export const createPatient = (patient) => {
    return api.post(API_URL, patient);
};

// UPDATE
export const updatePatient = (id, patient) => {
    return api.put(`${API_URL}/${id}`, patient);
};

// DELETE
export const deletePatient = (id) => {
    return api.delete(`${API_URL}/${id}`);
};