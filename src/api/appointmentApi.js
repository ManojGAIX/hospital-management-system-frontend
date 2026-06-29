import api from "./axiosConfig";

const API_URL = "http://localhost:8080/api/appointments";

// GET ALL

export const getAppointments = async () => {

    return await api.get(API_URL);
};

// CREATE

export const createAppointment = async (appointment) => {

    console.log("SENDING DATA =", appointment);

    return await api.post(
        API_URL,
        appointment,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

// updateAppointment

export const updateAppointment = (id, data) => api.put(`${API_URL}/${id}`, data);


// DELETE

export const deleteAppointment = async (id) => {

    return await api.delete(`${API_URL}/${id}`);
};

export const getAppointmentReceipt = (id) =>
  api.get(`${API_URL}/${id}/receipt`);