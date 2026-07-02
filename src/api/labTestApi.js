import api from "../services/api";

const API = "/api/labtests";

export const getLabTests = () =>
  api.get(API);

export const createLabTest = (data) =>
  api.post(API, data);

export const deleteLabTest = (id) =>
  api.delete(`${API}/${id}`);