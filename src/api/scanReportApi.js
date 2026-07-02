import api from "../services/api";

const API = "/api/scanreports";

export const getReports = () =>
  api.get(API);

export const uploadReport = (data) =>
  api.post(API, data, {
    headers: {
      "Content-Type":
        "multipart/form-data"
    }
  });

export const deleteReport = (id) =>
  api.delete(`${API}/${id}`);