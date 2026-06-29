import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/doctors";

export const getDoctors = () => api.get(API_URL);

export const updateDoctor = (id, data) => api.put(`${API_URL}/${id}`, data);
export const deleteDoctor = (id) => api.delete(`${API_URL}/${id}`);

export const createDoctor = (data) => {
  // Ensure we are sending a clean JS object
  return api.post(API_URL, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
