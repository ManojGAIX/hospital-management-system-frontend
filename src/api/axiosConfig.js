import api from "../services/api";

const res = api.create({
  baseURL: "/api",
});

res.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 401) {

      localStorage.clear();

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default res;