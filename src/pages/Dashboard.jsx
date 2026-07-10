import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PaymentsIcon from "@mui/icons-material/Payments";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { Link } from "react-router-dom";
import { getAppointments } from "../api/appointmentApi";
import {
  getHrAttendance,
  getHrDashboard,
  getHrEmployees,
  getHrLeaves,
  getHrPayroll,
} from "../api/hrApi";
import { getLowStockMedicines } from "../api/medicineApi";
import { getPatients } from "../api/patientApi";
import { formatDateTime } from "../utils/dateFormatter";

const palette = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#dbe4ee",
  page: "#f3f7fb",
  panel: "#ffffff",
  blue: "#1d4ed8",
  green: "#047857",
  amber: "#b45309",
  red: "#b91c1c",
  violet: "#6d28d9",
};

const panelSx = {
  borderRadius: 2,
  border: `1px solid ${palette.line}`,
  backgroundColor: palette.panel,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const tableHeadSx = {
  background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
  "& .MuiTableCell-root": {
    color: "#fff",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
};

function statusChipColor(status) {
  const value = String(status || "").toLowerCase();
  if (["completed", "active", "present", "ready", "approved"].includes(value)) return "success";
  if (["pending", "booked", "late entry", "draft", "half day"].includes(value)) return "warning";
  if (["cancelled", "absent", "hold", "rejected", "critical"].includes(value)) return "error";
  return "default";
}

function MetricCard({ title, value, detail, icon: Icon, gradient }) {
  return (
    <Card elevation={0} sx={{ ...panelSx, height: "100%", overflow: "hidden" }}>
      <CardContent
        sx={{
          minHeight: 138,
          p: 2.5,
          color: "#fff",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: 0, textTransform: "uppercase", opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 950, mt: 0.5, letterSpacing: 0 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, opacity: 0.9 }}>
            {detail}
          </Typography>
        </Box>
        <Avatar sx={{ width: 58, height: 58, bgcolor: "rgba(255,255,255,0.2)" }}>
          <Icon sx={{ fontSize: 32 }} />
        </Avatar>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1.5} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ color: palette.ink, fontWeight: 950 }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 700 }}>{subtitle}</Typography>
      </Box>
      {action}
    </Stack>
  );
}

export default function Dashboard() {
  const [counts, setCounts] = useState({ patients: 0, appointments: 0, todayAppointments: 0 });
  const [hrSummary, setHrSummary] = useState({ totalEmployees: 0, activeEmployees: 0, pendingLeaves: 0, readyPayroll: 0, payrollRows: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [hrEmployees, setHrEmployees] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveRows, setLeaveRows] = useState([]);
  const [payrollRows, setPayrollRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, lowStockRes, hrSummaryRes, hrEmployeesRes, attendanceRes, leavesRes, payrollRes] = await Promise.allSettled([
        getPatients(),
        getAppointments(),
        getLowStockMedicines(),
        getHrDashboard(),
        getHrEmployees(),
        getHrAttendance(),
        getHrLeaves(),
        getHrPayroll(),
      ]);

      const patients = patientsRes.status === "fulfilled" ? patientsRes.value.data?.data || [] : [];
      const appointments = appointmentsRes.status === "fulfilled" ? appointmentsRes.value.data || [] : [];
      const today = new Date().toISOString().split("T")[0];

      setCounts({
        patients: patients.length,
        appointments: appointments.length,
        todayAppointments: appointments.filter((appointment) => appointment.date?.split("T")[0] === today).length,
      });
      setPatientsList(patients);
      setRecentAppointments([...appointments].reverse().slice(0, 6));
      setLowStockMedicines(lowStockRes.status === "fulfilled" ? lowStockRes.value.data || [] : []);
      if (hrSummaryRes.status === "fulfilled") setHrSummary(hrSummaryRes.value.data);
      setHrEmployees(hrEmployeesRes.status === "fulfilled" ? hrEmployeesRes.value.data || [] : []);
      setAttendanceRows(attendanceRes.status === "fulfilled" ? attendanceRes.value.data || [] : []);
      setLeaveRows(leavesRes.status === "fulfilled" ? leavesRes.value.data || [] : []);
      setPayrollRows(payrollRes.status === "fulfilled" ? payrollRes.value.data || [] : []);
    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = (id, appointment) => {
    if (appointment?.patientName) return appointment.patientName;
    const patient = patientsList.find((item) => String(item.id) === String(id));
    return patient?.name || "Unknown Patient";
  };

  const readyPayrollPercent = useMemo(() => {
    const total = Number(hrSummary.payrollRows || payrollRows.length || 0);
    if (!total) return 0;
    return Math.round((Number(hrSummary.readyPayroll || 0) / total) * 100);
  }, [hrSummary, payrollRows.length]);

  const activeEmployeePercent = useMemo(() => {
    const total = Number(hrSummary.totalEmployees || hrEmployees.length || 0);
    if (!total) return 0;
    return Math.round((Number(hrSummary.activeEmployees || 0) / total) * 100);
  }, [hrEmployees.length, hrSummary]);

  const metrics = [
    { title: "Total Patients", value: counts.patients, detail: "Registered patient records", icon: PeopleIcon, gradient: "linear-gradient(135deg,#1E3A8A,#3B82F6)" },
    { title: "Today's Appts", value: counts.todayAppointments, detail: "Scheduled for today", icon: TodayIcon, gradient: "linear-gradient(135deg,#047857,#10B981)" },
    { title: "All Appts", value: counts.appointments, detail: "Total appointment volume", icon: EventIcon, gradient: "linear-gradient(135deg,#0369A1,#0EA5E9)" },
    { title: "Active Staff", value: hrSummary.activeEmployees || 0, detail: `${hrSummary.totalEmployees || 0} employees in HR master`, icon: VerifiedUserIcon, gradient: "linear-gradient(135deg,#0F766E,#14B8A6)" },
    { title: "Pending Leave", value: hrSummary.pendingLeaves || 0, detail: "Awaiting approval", icon: EventAvailableIcon, gradient: "linear-gradient(135deg,#B45309,#F59E0B)" },
    { title: "Low Stock", value: lowStockMedicines.length, detail: "Pharmacy items to review", icon: WarningAmberIcon, gradient: "linear-gradient(135deg,#991B1B,#EF4444)" },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, backgroundColor: palette.page, minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2, md: 3 }, mb: 2.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "#e0f2fe", color: "#075985", width: 54, height: 54 }}><LocalHospitalIcon /></Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 950, color: palette.ink, letterSpacing: 0 }}>Hospital Overview</Typography>
              <Typography sx={{ color: palette.muted, fontWeight: 750 }}>Real-time healthcare, HR, pharmacy and appointment performance</Typography>
            </Box>
          </Stack>
          <Button startIcon={<AddCircleIcon />} component={Link} to="/appointments" variant="contained" sx={{ borderRadius: 2, height: 48, px: 3, fontWeight: 900, textTransform: "none", background: "linear-gradient(135deg,#06B6D4,#1E40AF)", boxShadow: "0 10px 24px rgba(6,182,212,0.24)" }}>Book Appointment</Button>
        </Stack>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2.5, borderRadius: 999 }} />}

      <Grid container spacing={2.25} sx={{ mb: 2.5 }}>
        {metrics.map((metric) => <Grid key={metric.title} size={{ xs: 12, sm: 6, lg: 4 }}><MetricCard {...metric} /></Grid>)}
      </Grid>

      <Grid container spacing={2.25} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
            <SectionHeader title="Recent Appointments" subtitle="Latest appointment bookings and visit status" action={<Button endIcon={<ArrowForwardIcon />} component={Link} to="/appointments" sx={{ fontWeight: 900, textTransform: "none" }}>View All</Button>} />
            <TableContainer><Table size="small"><TableHead sx={tableHeadSx}><TableRow><TableCell>SI No</TableCell><TableCell>Patient ID</TableCell><TableCell>Patient</TableCell><TableCell>Doctor</TableCell><TableCell>Date & Time</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{recentAppointments.map((appointment, index) => (<TableRow key={appointment.id || index} hover><TableCell sx={{ fontWeight: 800 }}>{index + 1}</TableCell><TableCell>{`PRN${String(appointment.patientId || "").padStart(4, "0")}`}</TableCell><TableCell sx={{ fontWeight: 800 }}>{getPatientName(appointment.patientId, appointment)}</TableCell><TableCell>{appointment.doctorName || "N/A"}</TableCell><TableCell>{formatDateTime(appointment.date)}</TableCell><TableCell><Chip size="small" label={appointment.status || "Booked"} color={statusChipColor(appointment.status || "Booked")} sx={{ fontWeight: 850 }} /></TableCell></TableRow>))}{!recentAppointments.length && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: palette.muted, fontWeight: 800 }}>No recent appointments found.</TableCell></TableRow>}</TableBody></Table></TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ ...panelSx, p: 2, height: "100%" }}>
            <SectionHeader title="HR Dashboard" subtitle="Staff readiness, approvals and payroll" />
            <Stack spacing={2}>
              <Box><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}><Typography sx={{ fontWeight: 850 }}>Active employees</Typography><Typography sx={{ fontWeight: 950, color: palette.green }}>{activeEmployeePercent}%</Typography></Stack><LinearProgress variant="determinate" value={activeEmployeePercent} sx={{ height: 9, borderRadius: 999 }} /></Box>
              <Box><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}><Typography sx={{ fontWeight: 850 }}>Payroll ready</Typography><Typography sx={{ fontWeight: 950, color: palette.violet }}>{readyPayrollPercent}%</Typography></Stack><LinearProgress variant="determinate" value={readyPayrollPercent} color="secondary" sx={{ height: 9, borderRadius: 999 }} /></Box>
              {[["Total Employees", hrSummary.totalEmployees || 0, GroupsIcon, palette.blue], ["Pending Leave", hrSummary.pendingLeaves || 0, EventAvailableIcon, palette.amber], ["Attendance Rows", attendanceRows.length, AssignmentTurnedInIcon, palette.green], ["Payroll Rows", payrollRows.length, PaymentsIcon, palette.violet]].map(([label, value, Icon, color]) => (<Stack key={label} direction="row" alignItems="center" justifyContent="space-between" sx={{ borderTop: `1px solid ${palette.line}`, pt: 1.2 }}><Stack direction="row" spacing={1} alignItems="center"><Avatar sx={{ width: 34, height: 34, bgcolor: `${color}18`, color }}><Icon fontSize="small" /></Avatar><Typography sx={{ fontWeight: 850 }}>{label}</Typography></Stack><Typography sx={{ fontWeight: 950 }}>{value}</Typography></Stack>))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.25}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
            <SectionHeader title="HR Action Queue" subtitle="Leave approvals and attendance items needing attention" action={<Button component={Link} to="/hr/leave" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 900, textTransform: "none" }}>Open HR</Button>} />
            <TableContainer><Table size="small"><TableHead sx={tableHeadSx}><TableRow><TableCell>Request</TableCell><TableCell>Employee</TableCell><TableCell>Leave Type</TableCell><TableCell>Manager</TableCell><TableCell>HR</TableCell></TableRow></TableHead><TableBody>{leaveRows.slice(0, 5).map((row, index) => (<TableRow key={`${row[0]}-${index}`} hover><TableCell sx={{ fontWeight: 850 }}>{row[0]}</TableCell><TableCell>{row[1]}</TableCell><TableCell>{row[2]}</TableCell><TableCell><Chip size="small" label={row[6]} color={statusChipColor(row[6])} sx={{ fontWeight: 850 }} /></TableCell><TableCell><Chip size="small" label={row[7]} color={statusChipColor(row[7])} sx={{ fontWeight: 850 }} /></TableCell></TableRow>))}{!leaveRows.length && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: palette.muted, fontWeight: 800 }}>No leave requests found.</TableCell></TableRow>}</TableBody></Table></TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
            <SectionHeader title="Low Stock Medicines" subtitle="Pharmacy inventory alerts" action={<Button component={Link} to="/current-stock" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 900, textTransform: "none" }}>Stock</Button>} />
            <TableContainer><Table size="small"><TableHead sx={{ bgcolor: palette.red, "& .MuiTableCell-root": { color: "#fff", fontWeight: 900 } }}><TableRow><TableCell>Medicine</TableCell><TableCell>Batch</TableCell><TableCell>Stock</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{lowStockMedicines.slice(0, 6).map((medicine, index) => { const stock = Number(medicine.stockQuantity || medicine.stock || 0); return (<TableRow key={medicine.id || index} hover><TableCell sx={{ fontWeight: 850 }}>{medicine.medicineName}</TableCell><TableCell>{medicine.batchNo || "N/A"}</TableCell><TableCell sx={{ fontWeight: 950, color: stock <= 5 ? palette.red : palette.amber }}>{stock}</TableCell><TableCell><Chip size="small" label={stock <= 5 ? "Critical" : "Low Stock"} color={stock <= 5 ? "error" : "warning"} sx={{ fontWeight: 850 }} /></TableCell></TableRow>); })}{!lowStockMedicines.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: palette.muted, fontWeight: 800 }}>No low stock medicines.</TableCell></TableRow>}</TableBody></Table></TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
