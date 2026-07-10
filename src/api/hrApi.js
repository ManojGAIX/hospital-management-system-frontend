import api from "../services/api";

const API = "/api/hr";

export const getHrDashboard = () => api.get(`${API}/dashboard`);

export const getHrEmployees = () => api.get(`${API}/employees`);
export const createHrEmployee = (data) => api.post(`${API}/employees`, data);
export const updateHrEmployee = (id, data) => api.put(`${API}/employees/${id}`, data);
export const deleteHrEmployee = (id) => api.delete(`${API}/employees/${id}`);

export const getHrDepartments = () => api.get(`${API}/departments`);
export const createHrDepartment = (data) => api.post(`${API}/departments`, data);
export const updateHrDepartment = (id, data) => api.put(`${API}/departments/${id}`, data);
export const deleteHrDepartment = (id) => api.delete(`${API}/departments/${id}`);

export const getHrDesignations = () => api.get(`${API}/designations`);
export const createHrDesignation = (data) => api.post(`${API}/designations`, data);
export const updateHrDesignation = (id, data) => api.put(`${API}/designations/${id}`, data);
export const deleteHrDesignation = (id) => api.delete(`${API}/designations/${id}`);

export const getHrRoles = () => api.get(`${API}/roles`);
export const getHrAttendance = () => api.get(`${API}/attendance`);
export const getHrLeaves = () => api.get(`${API}/leaves`);
export const createHrLeave = (data) => api.post(`${API}/leaves`, data);
export const getHrShifts = () => api.get(`${API}/shifts`);
export const getHrHolidays = () => api.get(`${API}/holidays`);
export const getHrPayroll = () => api.get(`${API}/payroll`);
export const generateHrPayroll = (data) => api.post(`${API}/payroll/generate`, data);


export const createHrAttendance = (data) => api.post(`${API}/attendance`, data);
export const createHrHoliday = (data) => api.post(`${API}/holidays`, data);
export const uploadHrDocument = (data) => api.post(`${API}/documents`, data);
export const updateHrLeaveStatus = (requestNo, approver, status) => api.put(`${API}/leaves/${requestNo}/${approver}/${status}`);
