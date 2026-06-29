import api from "./axiosConfig";

const API =
  "http://localhost:8080/api/scanreports";

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