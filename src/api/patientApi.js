import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/patients";

// GET ALL
export const getPatients = () => {
    return api.get(API_URL);
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