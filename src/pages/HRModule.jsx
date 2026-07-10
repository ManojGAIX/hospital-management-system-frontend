import React, { useEffect, useMemo, useState } from "react";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";


import AddIcon from "@mui/icons-material/Add";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DomainIcon from "@mui/icons-material/Domain";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupsIcon from "@mui/icons-material/Groups";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PaymentsIcon from "@mui/icons-material/Payments";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WorkIcon from "@mui/icons-material/Work";

import { useLocation, useNavigate } from "react-router-dom";
import {
  createHrDepartment,
  createHrDesignation,
  createHrEmployee,
  uploadHrDocument,
  updateHrLeaveStatus,
  generateHrPayroll,
  createHrHoliday,
  createHrAttendance,
  createHrLeave,
  deleteHrEmployee,
  getHrAttendance,
  getHrDepartments,
  getHrDesignations,
  getHrEmployees,
  getHrHolidays,
  getHrLeaves,
  getHrPayroll,
  getHrRoles,
  getHrShifts,
  updateHrEmployee,
} from "../api/hrApi";

const departmentsSeed = [
  ["Administration", "Kavitha Rao", 8, "Active"],
  ["Doctors", "Dr. Nirmal Shah", 24, "Active"],
  ["Nursing", "Mary Thomas", 46, "Active"],
  ["Laboratory", "Rakesh Kumar", 12, "Active"],
  ["Pharmacy", "Anita Menon", 9, "Active"],
  ["Radiology", "Dr. Priya Iyer", 7, "Active"],
  ["Reception", "Sanjay Das", 11, "Active"],
  ["Accounts", "Neha Gupta", 6, "Active"],
  ["HR", "Vikram Singh", 5, "Active"],
  ["Housekeeping", "Latha K", 18, "Active"],
  ["Security", "Mohan R", 14, "Active"],
  ["Maintenance", "Ravi Prakash", 10, "Inactive"],
].map(([name, head, employees, status], index) => ({ id: index + 1, name, head, employees, status }));

const designationsSeed = [
  ["Medical Director", "Doctors", "L6"],
  ["Consultant", "Doctors", "L5"],
  ["Resident Doctor", "Doctors", "L3"],
  ["Staff Nurse", "Nursing", "L2"],
  ["Lab Technician", "Laboratory", "L2"],
  ["Pharmacist", "Pharmacy", "L2"],
  ["Receptionist", "Reception", "L1"],
  ["Cashier", "Accounts", "L1"],
  ["HR Executive", "HR", "L2"],
  ["Accountant", "Accounts", "L2"],
].map(([title, department, grade], index) => ({ id: index + 1, title, department, grade }));

const employeesSeed = [
  ["Dr. Arjun Mehta", "Doctors", "Consultant", "Consultant", "Active", "9876543210", "arjun.mehta@madhavhms.in", "Dr. Nirmal Shah", "HDFC Bank", 4],
  ["Mary Thomas", "Nursing", "Staff Nurse", "Permanent", "Active", "9898981111", "mary.thomas@madhavhms.in", "Kavitha Rao", "ICICI Bank", 4],
  ["Rakesh Kumar", "Laboratory", "Lab Technician", "Permanent", "Active", "9845012345", "rakesh.kumar@madhavhms.in", "Dr. Priya Iyer", "SBI", 3],
  ["Sanjay Das", "Reception", "Receptionist", "Contract", "Active", "9812312312", "sanjay.das@madhavhms.in", "Kavitha Rao", "Axis Bank", 3],
  ["Neha Gupta", "Accounts", "Accountant", "Permanent", "Resigned", "9822209876", "neha.gupta@madhavhms.in", "Kavitha Rao", "Kotak Bank", 3],
].map(([name, department, designation, type, status, mobile, email, manager, bank, docs], index) => ({
  id: index + 1,
  employeeId: `MH-EMP-2026-${String(index + 1).padStart(3, "0")}`,
  name,
  department,
  designation,
  type,
  status,
  mobile,
  email,
  manager,
  bank,
  joiningDate: "2026-07-09",
  emergency: "Emergency Contact",
  documents: ["Aadhaar", "PAN", "Photo", "License"].slice(0, docs),
}));

const attendanceSeed = [
  ["MH-EMP-2026-001", "Dr. Arjun Mehta", "Doctors", "09:05", "17:40", "8h 35m", "0h 35m", "Late Entry"],
  ["MH-EMP-2026-002", "Mary Thomas", "Nursing", "07:00", "15:10", "8h 10m", "0h 10m", "Present"],
  ["MH-EMP-2026-003", "Rakesh Kumar", "Laboratory", "08:55", "17:05", "8h 10m", "0h 10m", "Present"],
  ["MH-EMP-2026-004", "Sanjay Das", "Reception", "14:00", "20:00", "6h", "0h", "Half Day"],
  ["MH-EMP-2026-005", "Neha Gupta", "Accounts", "-", "-", "0h", "0h", "Absent"],
];

const leavesSeed = [
  ["LV-1021", "Mary Thomas", "Sick Leave", "2026-07-10", "2026-07-11", 2, "Approved", "Pending"],
  ["LV-1022", "Rakesh Kumar", "Casual Leave", "2026-07-14", "2026-07-14", 1, "Pending", "Pending"],
  ["LV-1023", "Dr. Arjun Mehta", "Earned Leave", "2026-07-20", "2026-07-22", 3, "Approved", "Approved"],
];

const shiftsSeed = [
  ["Morning", "07:00 - 15:00", 38, "Weekly", "Clinical"],
  ["Evening", "14:00 - 22:00", 27, "Weekly", "Clinical"],
  ["Night", "21:00 - 07:00", 19, "3-day block", "Critical care"],
  ["General", "09:00 - 18:00", 42, "Fixed", "Administration"],
  ["Emergency", "On call", 12, "Need based", "Emergency"],
];

const payrollSeed = [
  ["Dr. Arjun Mehta", 82000, 32800, 9000, 18000, 18200, 123600, "Ready"],
  ["Mary Thomas", 32000, 12800, 4500, 6500, 5200, 50600, "Ready"],
  ["Rakesh Kumar", 28000, 11200, 3900, 5000, 4600, 43500, "Draft"],
  ["Sanjay Das", 18000, 7200, 2500, 2500, 2400, 27800, "Hold"],
];

const holidaysSeed = [
  ["2026-01-26", "Republic Day", "National", "All"],
  ["2026-08-15", "Independence Day", "National", "All"],
  ["2026-10-20", "Deepavali", "Festival", "All"],
  ["2026-12-25", "Christmas", "Festival", "All"],
  ["Every Sunday", "Weekly Off", "Weekly Off", "Administration"],
];

const rolesSeed = [
  ["HR Admin", "Admin", "HR", "All HR setup, payroll, reports"],
  ["HR Executive", "Staff", "HR", "Employee, attendance, leave"],
  ["Doctor", "Clinical", "Doctors", "Directory, shift view, leave apply"],
  ["Nurse", "Clinical", "Nursing", "Attendance, shift, leave apply"],
  ["Receptionist", "Front Desk", "Reception", "Directory view"],
  ["Administrator", "Admin", "Administration", "Full hospital access"],
];

const tabs = [
  ["Dashboard", "/hr", GroupsIcon],
  ["Employees", "/hr/employees", BadgeIcon],
  ["Departments", "/hr/departments", DomainIcon],
  ["Designations", "/hr/designations", WorkIcon],
  ["Roles", "/hr/roles", ManageAccountsIcon],
  ["Attendance", "/hr/attendance", AssignmentTurnedInIcon],
  ["Shifts", "/hr/shifts", ScheduleIcon],
  ["Leave", "/hr/leave", EventAvailableIcon],
  ["Holidays", "/hr/holidays", CalendarMonthIcon],
  ["Payroll", "/hr/payroll", PaymentsIcon],
  ["Documents", "/hr/documents", DescriptionIcon],
  ["Reports", "/hr/reports", PictureAsPdfIcon],
];

const blankEmployee = {
  name: "",
  mobile: "",
  email: "",
  department: "Administration",
  designation: "Receptionist",
  type: "Permanent",
  joiningDate: "2026-07-09",
  manager: "",
  status: "Active",
  emergency: "",
  bank: "",
};


const blankLeave = {
  employeeName: "",
  leaveType: "Sick Leave",
  fromDate: "2026-07-09",
  toDate: "2026-07-09",
  days: 1,
};

const blankAttendance = {
  employeeName: "",
  attendanceDate: "2026-07-09",
  inTime: "09:00",
  outTime: "18:00",
  totalHours: "8h",
  overtime: "0h",
  status: "Present",
};

const blankHoliday = {
  holidayDate: "2026-07-09",
  name: "",
  type: "Hospital",
  department: "All",
};

const blankDocument = {
  employeeId: "",
  documentType: "Aadhaar",
  fileName: "",
  expiryDate: "",
  status: "Active",
};
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const hrTheme = {
  navy: "#0f3f68",
  navyDark: "#082f49",
  blue: "#1e40af",
  teal: "#008374",
  tealSoft: "#e6f6f4",
  surface: "#ffffff",
  page: "#eef3f8",
  line: "#dbe4ee",
  text: "#0f172a",
  muted: "#64748b",
  danger: "#b91c1c",
};

const panelSx = {
  p: 2,
  borderRadius: 2,
  border: `1px solid ${hrTheme.line}`,
  background: hrTheme.surface,
  boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
};

const tableHeadSx = {
  background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
};

const primaryButtonSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 900,
  background: `linear-gradient(135deg, ${hrTheme.navy}, ${hrTheme.teal})`,
  boxShadow: "0 8px 18px rgba(15,63,104,0.18)",
  "&:hover": {
    background: `linear-gradient(135deg, ${hrTheme.navyDark}, ${hrTheme.navy})`,
    boxShadow: "0 10px 22px rgba(15,63,104,0.24)",
  },
};

const secondaryButtonSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 800,
  color: hrTheme.navy,
  borderColor: "#b9d4df",
  "&:hover": {
    borderColor: hrTheme.teal,
    backgroundColor: hrTheme.tealSoft,
  },
};

function statusColor(status) {
  if (["Active", "Present", "Ready", "Approved", "Compliant"].includes(status)) return "success";
  if (["Pending", "Late Entry", "Draft", "Review", "Half Day"].includes(status)) return "warning";
  if (["Inactive", "Absent", "Hold", "Resigned", "Terminated"].includes(status)) return "error";
  return "default";
}

function StatCard({ title, value, detail, icon: Icon, color }) {
  return (
    <Paper elevation={0} sx={{ ...panelSx, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box>
          <Typography variant="body2" sx={{ color: hrTheme.muted, fontWeight: 800 }}>{title}</Typography>
          <Typography variant="h4" sx={{ color: hrTheme.text, fontWeight: 900, mt: 0.5 }}>{value}</Typography>
          <Typography variant="caption" sx={{ color: hrTheme.muted, fontWeight: 700 }}>{detail}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 44, height: 44 }}><Icon fontSize="small" /></Avatar>
      </Stack>
    </Paper>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, color: hrTheme.text }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: hrTheme.muted, fontWeight: 600 }}>{subtitle}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

function DataTable({ heads, rows, dark = true }) {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead sx={dark ? tableHeadSx : undefined}>
          <TableRow>
            {heads.map((head) => <TableCell key={head} sx={{ color: dark ? "#fff" : hrTheme.text, fontWeight: 900 }}>{head}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row[0]}-${index}`} hover>
              {row.map((cell, cellIndex) => (
                <TableCell key={`${cell}-${cellIndex}`} sx={cellIndex === 0 ? { fontWeight: 850 } : undefined}>
                  {["Active", "Inactive", "Present", "Late Entry", "Half Day", "Absent", "Approved", "Pending", "Ready", "Draft", "Hold"].includes(String(cell)) ? (
                    <Chip size="small" label={cell} color={statusColor(cell)} sx={{ fontWeight: 800 }} />
                  ) : cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {!rows.length && (
            <TableRow>
              <TableCell colSpan={heads.length} align="center" sx={{ py: 5, color: hrTheme.muted, fontWeight: 700 }}>No records found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function HRModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(employeesSeed);
  const [departments, setDepartments] = useState(departmentsSeed);
  const [designations, setDesignations] = useState(designationsSeed);
  const [attendance, setAttendance] = useState(attendanceSeed);
  const [leaves, setLeaves] = useState(leavesSeed);
  const [shifts, setShifts] = useState(shiftsSeed);
  const [payroll, setPayroll] = useState(payrollSeed);
  const [holidays, setHolidays] = useState(holidaysSeed);
  const [roles, setRoles] = useState(rolesSeed);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [employeeForm, setEmployeeForm] = useState(blankEmployee);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ name: "", head: "", status: "Active" });
  const [designationForm, setDesignationForm] = useState({ title: "", department: "Administration", grade: "L1" });
  const [leaveForm, setLeaveForm] = useState(blankLeave);
  const [attendanceForm, setAttendanceForm] = useState(blankAttendance);
  const [holidayForm, setHolidayForm] = useState(blankHoliday);
  const [documentForm, setDocumentForm] = useState(blankDocument);

  const activePath = tabs.some(([, path]) => path === location.pathname) ? location.pathname : "/hr";
  const activeIndex = Math.max(0, tabs.findIndex(([, path]) => path === activePath));

  useEffect(() => {
    loadHrData();
  }, []);

  const listFrom = (result, fallback) => {
    if (result.status !== "fulfilled") return fallback;
    return Array.isArray(result.value.data) ? result.value.data : fallback;
  };

  const loadHrData = async () => {
    setLoading(true);
    setApiError("");
    const results = await Promise.allSettled([
      getHrEmployees(),
      getHrDepartments(),
      getHrDesignations(),
      getHrAttendance(),
      getHrLeaves(),
      getHrShifts(),
      getHrPayroll(),
      getHrHolidays(),
      getHrRoles(),
    ]);

    setEmployees(listFrom(results[0], employeesSeed));
    setDepartments(listFrom(results[1], departmentsSeed));
    setDesignations(listFrom(results[2], designationsSeed));
    setAttendance(listFrom(results[3], attendanceSeed));
    setLeaves(listFrom(results[4], leavesSeed));
    setShifts(listFrom(results[5], shiftsSeed));
    setPayroll(listFrom(results[6], payrollSeed));
    setHolidays(listFrom(results[7], holidaysSeed));
    setRoles(listFrom(results[8], rolesSeed));

    if (results.some((result) => result.status === "rejected")) {
      setApiError("Could not load all HR backend data. Showing available records and local fallback data.");
    }
    setLoading(false);
  };

  const leaveRowFromResponse = (leave) => [
    leave.requestNo,
    leave.employeeName,
    leave.leaveType,
    leave.fromDate,
    leave.toDate,
    leave.days,
    leave.managerStatus,
    leave.hrStatus,
  ];

  const attendanceRowFromResponse = (row) => [
    row.employeeId,
    row.employeeName,
    row.department,
    row.inTime || "-",
    row.outTime || "-",
    row.totalHours,
    row.overtime,
    row.status,
  ];

  const holidayRowFromResponse = (row) => [row.holidayDate, row.name, row.type, row.department];

  const downloadReport = (reportName, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportName.toLowerCase().replaceAll(" ", "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const filteredEmployees = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return employees.filter((employee) => {
      const matchesSearch = !needle || Object.values(employee).join(" ").toLowerCase().includes(needle);
      const matchesDepartment = departmentFilter === "All" || employee.department === departmentFilter;
      const matchesStatus = statusFilter === "All" || employee.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, employees, search, statusFilter]);

  const saveEmployee = async () => {
    if (!employeeForm.name || !employeeForm.mobile || !employeeForm.department) return;
    setLoading(true);
    setApiError("");
    try {
      if (editingEmployeeId) {
        const response = await updateHrEmployee(editingEmployeeId, employeeForm);
        setEmployees((current) => current.map((employee) => (employee.id === editingEmployeeId ? response.data : employee)));
      } else {
        const response = await createHrEmployee(employeeForm);
        setEmployees((current) => [response.data, ...current]);
      }
      setEmployeeForm(blankEmployee);
      setEditingEmployeeId(null);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to save employee. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const editEmployee = (employee) => {
    const { id, employeeId, documents, ...editable } = employee;
    setEditingEmployeeId(id);
    setEmployeeForm(editable);
  };

  const addDepartment = async () => {
    if (!departmentForm.name) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await createHrDepartment({ ...departmentForm, head: departmentForm.head || "Not assigned" });
      setDepartments((current) => [response.data, ...current]);
      setDepartmentForm({ name: "", head: "", status: "Active" });
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to save department. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const addDesignation = async () => {
    if (!designationForm.title) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await createHrDesignation(designationForm);
      setDesignations((current) => [response.data, ...current]);
      setDesignationForm({ title: "", department: "Administration", grade: "L1" });
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to save designation. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const removeEmployee = async (id) => {
    setLoading(true);
    setApiError("");
    try {
      await deleteHrEmployee(id);
      setEmployees((current) => current.filter((employee) => employee.id !== id));
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to delete employee. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const applyLeave = async () => {
    if (!leaveForm.employeeName || !leaveForm.fromDate || !leaveForm.toDate) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        ...leaveForm,
        days: Number(leaveForm.days) || 1,
        managerStatus: "Pending",
        hrStatus: "Pending",
      };
      const response = await createHrLeave(payload);
      setLeaves((current) => [leaveRowFromResponse(response.data), ...current]);
      setLeaveForm(blankLeave);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to apply leave. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };
  const saveAttendance = async () => {
    const employee = employees.find((item) => item.name === attendanceForm.employeeName);
    if (!employee) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await createHrAttendance({ ...attendanceForm, employeeId: employee.employeeId, department: employee.department });
      setAttendance((current) => [attendanceRowFromResponse(response.data), ...current]);
      setAttendanceForm(blankAttendance);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to save attendance. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const saveHoliday = async () => {
    if (!holidayForm.name || !holidayForm.holidayDate) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await createHrHoliday(holidayForm);
      setHolidays((current) => [holidayRowFromResponse(response.data), ...current]);
      setHolidayForm(blankHoliday);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to add holiday. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const runPayroll = async () => {
    setLoading(true);
    setApiError("");
    try {
      const response = await generateHrPayroll({});
      setPayroll(response.data);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to generate payroll. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    if (!documentForm.employeeId || !documentForm.documentType) return;
    setLoading(true);
    setApiError("");
    try {
      const response = await uploadHrDocument(documentForm);
      setEmployees((current) => current.map((employee) => (employee.id === response.data.id ? response.data : employee)));
      setDocumentForm(blankDocument);
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to upload document. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };

  const changeLeaveStatus = async (requestNo, approver, status) => {
    setLoading(true);
    setApiError("");
    try {
      const response = await updateHrLeaveStatus(requestNo, approver, status);
      const updated = leaveRowFromResponse(response.data);
      setLeaves((current) => current.map((row) => (row[0] === requestNo ? updated : row)));
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to update leave approval. Please check the HR backend API.");
    } finally {
      setLoading(false);
    }
  };
  const dashboard = () => (
    <Stack spacing={2.25}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Total Employees" value={employees.length} detail="Across all departments" icon={GroupsIcon} color="#0f3f68" /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Active Employees" value={employees.filter((e) => e.status === "Active").length} detail="Available for duty" icon={VerifiedUserIcon} color="#047857" /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Pending Leave" value={leaves.filter((leave) => leave[7] === "Pending").length} detail="Awaiting HR action" icon={EventAvailableIcon} color="#b45309" /></Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard title="Payroll Status" value={`${payroll.filter((row) => row[7] === "Ready").length}/${payroll.length}`} detail="Ready for salary run" icon={PaymentsIcon} color="#7c3aed" /></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={panelSx}>
            <SectionHeader title="Attendance Summary" subtitle="Daily attendance, late entry, half day and absent tracking" />
            <DataTable heads={["Employee ID", "Name", "Department", "In", "Out", "Hours", "Overtime", "Status"]} rows={attendance} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ ...panelSx, height: "100%" }}>
            <SectionHeader title="HR Alerts" subtitle="Items needing attention" />
            {[["New joiners", 4, "#0ea5e9"], ["Today's birthdays", 2, "#10b981"], ["Expiring documents", 7, "#f97316"], ["Upcoming confirmations", 3, "#7c3aed"]].map(([label, value, color]) => (
              <Box key={label} sx={{ mb: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color }}>{value}</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={Math.min(Number(value) * 14, 100)} sx={{ height: 8, borderRadius: 999, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { bgcolor: color } }} />
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );

  const employeesView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title={editingEmployeeId ? "Update Employee" : "Employee Registration"} subtitle="Personal, contact, reporting and bank details" />
          <Grid container spacing={1.5}>
            {["name", "mobile", "email", "manager", "emergency", "bank"].map((name) => (
              <Grid size={{ xs: 12, sm: 6, lg: 12 }} key={name}>
                <TextField fullWidth size="small" label={name.replace(/^\w/, (c) => c.toUpperCase())} value={employeeForm[name]} onChange={(event) => setEmployeeForm({ ...employeeForm, [name]: event.target.value })} />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}><SelectField label="Department" value={employeeForm.department} items={departments.map((d) => d.name)} onChange={(value) => setEmployeeForm({ ...employeeForm, department: value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SelectField label="Designation" value={employeeForm.designation} items={designations.map((d) => d.title)} onChange={(value) => setEmployeeForm({ ...employeeForm, designation: value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SelectField label="Employment Type" value={employeeForm.type} items={["Permanent", "Contract", "Consultant", "Intern"]} onChange={(value) => setEmployeeForm({ ...employeeForm, type: value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><SelectField label="Status" value={employeeForm.status} items={["Active", "Inactive", "Resigned", "Terminated"]} onChange={(value) => setEmployeeForm({ ...employeeForm, status: value })} /></Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={saveEmployee} disabled={loading} sx={primaryButtonSx}>{editingEmployeeId ? "Update Employee" : "Save Employee"}</Button>
            <Button variant="outlined" startIcon={<UploadFileIcon />} sx={secondaryButtonSx}>Documents</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Employee Directory" subtitle="Search and filter by department, designation, mobile, email and status" />
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField fullWidth size="small" placeholder="Search employees" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            <SelectField label="Department" value={departmentFilter} items={["All", ...departments.map((d) => d.name)]} onChange={setDepartmentFilter} minWidth={180} />
            <SelectField label="Status" value={statusFilter} items={["All", "Active", "Inactive", "Resigned", "Terminated"]} onChange={setStatusFilter} minWidth={150} />
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead sx={tableHeadSx}><TableRow>{["Employee", "Department", "Type", "Manager", "Status", "Actions"].map((head) => <TableCell key={head} sx={{ color: "#fff", fontWeight: 900 }}>{head}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell><Stack direction="row" spacing={1.25} alignItems="center"><Avatar sx={{ bgcolor: hrTheme.tealSoft, color: hrTheme.navy, fontWeight: 900 }}>{employee.name.charAt(0)}</Avatar><Box><Typography variant="body2" sx={{ fontWeight: 900 }}>{employee.name}</Typography><Typography variant="caption" sx={{ color: hrTheme.muted, fontWeight: 700 }}>{employee.employeeId} | {employee.mobile}</Typography></Box></Stack></TableCell>
                    <TableCell>{employee.department}<br /><Typography variant="caption">{employee.designation}</Typography></TableCell>
                    <TableCell>{employee.type}</TableCell>
                    <TableCell>{employee.manager}</TableCell>
                    <TableCell><Chip size="small" label={employee.status} color={statusColor(employee.status)} sx={{ fontWeight: 800 }} /></TableCell>
                    <TableCell><Stack direction="row" spacing={0.5}><Tooltip title="Edit employee"><IconButton size="small" onClick={() => editEmployee(employee)}><EditIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Delete employee"><IconButton size="small" color="error" onClick={() => removeEmployee(employee.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip></Stack></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const departmentsView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Add Department" subtitle="Create and manage departments" />
          <Stack spacing={1.5}>
            <TextField size="small" label="Department Name" value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} />
            <TextField size="small" label="Department Head" value={departmentForm.head} onChange={(event) => setDepartmentForm({ ...departmentForm, head: event.target.value })} />
            <SelectField label="Status" value={departmentForm.status} items={["Active", "Inactive"]} onChange={(value) => setDepartmentForm({ ...departmentForm, status: value })} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={addDepartment} disabled={loading} sx={primaryButtonSx}>Add Department</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={1.5}>
          {departments.map((department) => (
            <Grid key={department.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Paper elevation={0} sx={{ ...panelSx, p: 1.75, height: "100%" }}>
                <Stack direction="row" justifyContent="space-between"><DomainIcon sx={{ color: hrTheme.navy }} /><Chip size="small" label={department.status} color={statusColor(department.status)} sx={{ fontWeight: 800 }} /></Stack>
                <Typography sx={{ fontWeight: 900, mt: 1 }}>{department.name}</Typography>
                <Typography variant="body2" sx={{ color: hrTheme.muted }}>{department.head}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>{department.employees} employees</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const designationsView = () => (
    <Paper elevation={0} sx={panelSx}>
      <SectionHeader title="Designation Management" subtitle="Add, update, delete and map to department" />
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth size="small" label="Designation" value={designationForm.title} onChange={(event) => setDesignationForm({ ...designationForm, title: event.target.value })} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><SelectField label="Department" value={designationForm.department} items={departments.map((d) => d.name)} onChange={(value) => setDesignationForm({ ...designationForm, department: value })} /></Grid>
        <Grid size={{ xs: 12, md: 2 }}><TextField fullWidth size="small" label="Grade" value={designationForm.grade} onChange={(event) => setDesignationForm({ ...designationForm, grade: event.target.value })} /></Grid>
        <Grid size={{ xs: 12, md: 2 }}><Button fullWidth variant="contained" onClick={addDesignation} disabled={loading} sx={{ ...primaryButtonSx, height: 40 }}>Add</Button></Grid>
      </Grid>
      <DataTable heads={["Designation", "Department", "Grade", "Actions"]} rows={designations.map((d) => [d.title, d.department, d.grade, <Stack direction="row" spacing={0.5}><IconButton size="small"><EditIcon fontSize="small" /></IconButton><IconButton size="small" color="error"><DeleteIcon fontSize="small" /></IconButton></Stack>])} />
    </Paper>
  );

  const shiftsView = () => (
    <Grid container spacing={2}>
      {shifts.map(([name, time, assigned, rotation, type]) => (
        <Grid key={name} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper elevation={0} sx={{ ...panelSx, height: "100%" }}>
            <ScheduleIcon sx={{ color: hrTheme.navy }} />
            <Typography variant="h6" sx={{ fontWeight: 900, mt: 1 }}>{name}</Typography>
            <Typography sx={{ color: hrTheme.muted, fontWeight: 700 }}>{time}</Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2"><b>{assigned}</b> assigned</Typography>
            <Typography variant="body2">Rotation: {rotation}</Typography>
            <Typography variant="body2">Type: {type}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const leaveView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Apply Leave" subtitle="Create leave request for manager and HR approval" />
          <Stack spacing={1.5}>
            <SelectField label="Employee" value={leaveForm.employeeName} items={["", ...employees.map((employee) => employee.name)]} onChange={(value) => setLeaveForm({ ...leaveForm, employeeName: value })} />
            <SelectField label="Leave Type" value={leaveForm.leaveType} items={["Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Paternity Leave", "Unpaid Leave"]} onChange={(value) => setLeaveForm({ ...leaveForm, leaveType: value })} />
            <TextField fullWidth size="small" type="date" label="From Date" value={leaveForm.fromDate} onChange={(event) => setLeaveForm({ ...leaveForm, fromDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="date" label="To Date" value={leaveForm.toDate} onChange={(event) => setLeaveForm({ ...leaveForm, toDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="number" label="Days" value={leaveForm.days} onChange={(event) => setLeaveForm({ ...leaveForm, days: event.target.value })} inputProps={{ min: 1 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={applyLeave} disabled={loading} sx={primaryButtonSx}>Apply Leave</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Panel title="Leave Management" subtitle="Employee applies, manager approval, HR approval, balance update">
          <DataTable heads={["Request", "Employee", "Leave Type", "From", "To", "Days", "Manager", "HR", "Actions"]} rows={leaves.map((row) => [...row, <Stack direction="row" spacing={0.5}><Button size="small" variant="outlined" onClick={() => changeLeaveStatus(row[0], "manager", "Approved")}>Mgr OK</Button><Button size="small" variant="outlined" onClick={() => changeLeaveStatus(row[0], "hr", "Approved")}>HR OK</Button><Button size="small" color="error" onClick={() => changeLeaveStatus(row[0], "hr", "Rejected")}>Reject</Button></Stack>])} />
        </Panel>
      </Grid>
    </Grid>
  );
  const attendanceView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Manual Attendance" subtitle="Record staff attendance" />
          <Stack spacing={1.5}>
            <SelectField label="Employee" value={attendanceForm.employeeName} items={["", ...employees.map((employee) => employee.name)]} onChange={(value) => setAttendanceForm({ ...attendanceForm, employeeName: value })} />
            <TextField fullWidth size="small" type="date" label="Date" value={attendanceForm.attendanceDate} onChange={(event) => setAttendanceForm({ ...attendanceForm, attendanceDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="time" label="In Time" value={attendanceForm.inTime} onChange={(event) => setAttendanceForm({ ...attendanceForm, inTime: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" type="time" label="Out Time" value={attendanceForm.outTime} onChange={(event) => setAttendanceForm({ ...attendanceForm, outTime: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" label="Total Hours" value={attendanceForm.totalHours} onChange={(event) => setAttendanceForm({ ...attendanceForm, totalHours: event.target.value })} />
            <TextField fullWidth size="small" label="Overtime" value={attendanceForm.overtime} onChange={(event) => setAttendanceForm({ ...attendanceForm, overtime: event.target.value })} />
            <SelectField label="Status" value={attendanceForm.status} items={["Present", "Late Entry", "Half Day", "Absent"]} onChange={(value) => setAttendanceForm({ ...attendanceForm, status: value })} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={saveAttendance} disabled={loading} sx={primaryButtonSx}>Save Attendance</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Panel title="Attendance Management" subtitle="Manual entry, biometric import and Excel upload support">
          <DataTable heads={["Employee ID", "Name", "Department", "In Time", "Out Time", "Total Hours", "Overtime", "Status"]} rows={attendance} />
        </Panel>
      </Grid>
    </Grid>
  );

  const holidaysView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Add Holiday" subtitle="Create hospital or department holiday" />
          <Stack spacing={1.5}>
            <TextField fullWidth size="small" type="date" label="Holiday Date" value={holidayForm.holidayDate} onChange={(event) => setHolidayForm({ ...holidayForm, holidayDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            <TextField fullWidth size="small" label="Holiday Name" value={holidayForm.name} onChange={(event) => setHolidayForm({ ...holidayForm, name: event.target.value })} />
            <SelectField label="Type" value={holidayForm.type} items={["National", "Festival", "Weekly Off", "Hospital", "Department"]} onChange={(value) => setHolidayForm({ ...holidayForm, type: value })} />
            <SelectField label="Department" value={holidayForm.department} items={["All", ...departments.map((department) => department.name)]} onChange={(value) => setHolidayForm({ ...holidayForm, department: value })} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={saveHoliday} disabled={loading} sx={primaryButtonSx}>Add Holiday</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Panel title="Holiday Calendar" subtitle="National, festival, weekly off, hospital and department holidays">
          <DataTable heads={["Date", "Holiday", "Type", "Department"]} rows={holidays} />
        </Panel>
      </Grid>
    </Grid>
  );
  const payrollView = () => (
    <Paper elevation={0} sx={panelSx}>
      <SectionHeader title="Payroll Processing" subtitle="Salary master, earnings, deductions, payslip and salary register" action={<Button variant="contained" startIcon={<PaymentsIcon />} onClick={runPayroll} disabled={loading} sx={primaryButtonSx}>Generate Payroll</Button>} />
      <DataTable heads={["Employee", "Basic", "HRA", "DA", "Allowance", "Deductions", "Net Salary", "Status"]} rows={payroll.map((row) => [row[0], ...row.slice(1, 7).map((amount) => money.format(amount)), row[7]])} />
    </Paper>
  );

  const documentsView = () => (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Upload Document" subtitle="Attach employee compliance document" />
          <Stack spacing={1.5}>
            <SelectField label="Employee" value={documentForm.employeeId} items={["", ...employees.map((employee) => employee.id)]} onChange={(value) => setDocumentForm({ ...documentForm, employeeId: value })} />
            <SelectField label="Document Type" value={documentForm.documentType} items={["Aadhaar", "PAN", "Photo", "License", "Certificate", "Contract"]} onChange={(value) => setDocumentForm({ ...documentForm, documentType: value })} />
            <TextField fullWidth size="small" label="File Name" value={documentForm.fileName} onChange={(event) => setDocumentForm({ ...documentForm, fileName: event.target.value })} />
            <TextField fullWidth size="small" type="date" label="Expiry Date" value={documentForm.expiryDate} onChange={(event) => setDocumentForm({ ...documentForm, expiryDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={saveDocument} disabled={loading} sx={primaryButtonSx}>Upload</Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper elevation={0} sx={panelSx}>
          <SectionHeader title="Employee Documents" subtitle="Uploaded documents with compliance status" />
          <TableContainer><Table size="small"><TableHead sx={tableHeadSx}><TableRow>{["Employee", "Documents", "Bank", "Expiry Status", "Action"].map((head) => <TableCell key={head} sx={{ color: "#fff", fontWeight: 900 }}>{head}</TableCell>)}</TableRow></TableHead><TableBody>{employees.map((employee) => <TableRow key={employee.employeeId || employee.id} hover><TableCell sx={{ fontWeight: 800 }}>{employee.name}</TableCell><TableCell>{(employee.documents || []).map((doc) => <Chip key={doc} size="small" label={doc} sx={{ mr: 0.5, mb: 0.5, fontWeight: 700 }} />)}</TableCell><TableCell>{employee.bank}</TableCell><TableCell><Chip size="small" label={(employee.documents || []).length >= 4 ? "Compliant" : "Review"} color={(employee.documents || []).length >= 4 ? "success" : "warning"} sx={{ fontWeight: 800 }} /></TableCell><TableCell><IconButton size="small" onClick={() => setDocumentForm({ ...documentForm, employeeId: employee.id })}><UploadFileIcon fontSize="small" /></IconButton></TableCell></TableRow>)}</TableBody></Table></TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const reportsView = () => (
    <Grid container spacing={2}>
      {["Employee List", "Department Wise Employees", "Attendance Report", "Leave Report", "Payroll Report", "Joining Report", "Exit Report", "Holiday Report", "Shift Report", "Appraisal Report"].map((report) => (
        <Grid key={report} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper elevation={0} sx={panelSx}>
            <PictureAsPdfIcon sx={{ color: hrTheme.danger }} />
            <Typography sx={{ fontWeight: 900, mt: 1 }}>{report}</Typography>
            <Typography variant="body2" sx={{ color: hrTheme.muted, mb: 1.5 }}>PDF, Excel and print ready</Typography>
            <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadReport(report, report.includes("Attendance") ? attendance : report.includes("Leave") ? leaves : report.includes("Payroll") ? payroll : report.includes("Holiday") ? holidays : employees.map((employee) => [employee.employeeId, employee.name, employee.department, employee.designation, employee.status]))} sx={secondaryButtonSx}>Generate</Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const content = {
    "/hr": dashboard,
    "/hr/employees": employeesView,
    "/hr/departments": departmentsView,
    "/hr/designations": designationsView,
    "/hr/roles": () => <Panel title="Employee Role Management" subtitle="Assign role, user type, department and permissions"><DataTable heads={["Role", "User Type", "Department", "Permissions"]} rows={roles} /></Panel>,
    "/hr/attendance": attendanceView,
    "/hr/shifts": shiftsView,
    "/hr/leave": leaveView,
    "/hr/holidays": holidaysView,
    "/hr/payroll": payrollView,
    "/hr/documents": documentsView,
    "/hr/reports": reportsView,
  };

  return (
    <Box sx={{ minHeight: "100%", p: { xs: 0.5, md: 1 }, color: hrTheme.text }}>
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderRadius: 2, border: `1px solid ${hrTheme.line}`, background: `linear-gradient(135deg, ${hrTheme.surface} 0%, #f8fbff 100%)` }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar sx={tableHeadSx}><GroupsIcon /></Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: 0 }}>HR Module</Typography>
              <Typography variant="body2" sx={{ color: hrTheme.muted, fontWeight: 700 }}>Production-ready human resources operations for HMS</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {["Permanent", "Contract", "Consultant", "Intern"].map((type) => <Chip key={type} label={`${type}: ${employees.filter((e) => e.type === type).length}`} sx={{ fontWeight: 800, bgcolor: hrTheme.tealSoft }} />)}
          </Stack>
        </Stack>
      </Paper>

      {apiError && <Paper elevation={0} sx={{ ...panelSx, mb: 2, borderColor: "#f59e0b", bgcolor: "#fffbeb" }}><Typography variant="body2" sx={{ color: "#92400e", fontWeight: 800 }}>{apiError}</Typography></Paper>}
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />}

      <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, border: `1px solid ${hrTheme.line}`, overflow: "hidden" }}>
        <Tabs value={activeIndex} onChange={(_, index) => navigate(tabs[index][1])} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 48, "& .MuiTab-root": { minHeight: 48, textTransform: "none", fontWeight: 850 } }}>
          {tabs.map(([label, path, Icon]) => <Tab key={path} icon={<Icon fontSize="small" />} iconPosition="start" label={label} />)}
        </Tabs>
      </Paper>

      {content[activePath]()}
    </Box>
  );
}

function SelectField({ label, value, items, onChange, minWidth }) {
  return (
    <TextField select fullWidth size="small" label={label} value={value} onChange={(event) => onChange(event.target.value)} sx={{ minWidth }}>
      {items.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
    </TextField>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <Paper elevation={0} sx={panelSx}>
      <SectionHeader title={title} subtitle={subtitle} action={action} />
      {children}
    </Paper>
  );
}













