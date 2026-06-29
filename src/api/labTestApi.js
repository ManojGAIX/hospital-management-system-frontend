import api from "./axiosConfig";

const API =
  "http://localhost:8080/api/labtests";

export const getLabTests = () =>
  api.get(API);

export const createLabTest = (data) =>
  api.post(API, data);

export const deleteLabTest = (id) =>
  api.delete(`${API}/${id}`);