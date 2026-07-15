import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import BedIcon from "@mui/icons-material/Bed";
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import TodayIcon from "@mui/icons-material/Today";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { Link } from "react-router-dom";
import { getAppointments } from "../api/appointmentApi";
import { getHrAttendance, getHrDashboard, getHrLeaves } from "../api/hrApi";
import { getLowStockMedicines } from "../api/medicineApi";
import { getPatients } from "../api/patientApi";
import api from "../services/api";
import { getMedicineLabel } from "../utils/medicineFormatter";

const palette = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "rgba(148, 163, 184, 0.35)",
  page: "linear-gradient(145deg, #e8eef6 0%, #f5f8fc 40%, #eef2f8 100%)",
  blue: "#2563eb",
  green: "#059669",
  amber: "#d97706",
  red: "#dc2626",
  violet: "#7c3aed",
  teal: "#0d9488",
};

const gradients = {
  blue: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  green: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
  teal: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
  violet: "linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)",
  amber: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
  red: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
  indigo: "linear-gradient(135deg, #3730a3 0%, #6366f1 100%)",
  cyan: "linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)",
};

const glassSx = {
  borderRadius: 3,
  border: "1px solid rgba(255,255,255,0.72)",
  background: "rgba(255,255,255,0.58)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow:
    "0 8px 32px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255,255,255,0.85)",
};

function tableHeadSx(gradient) {
  return {
    background: gradient || gradients.blue,
    "& .MuiTableCell-root": {
      color: "#fff",
      fontWeight: 800,
      whiteSpace: "nowrap",
      borderBottom: "none",
    },
  };
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function datePart(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

function isToday(value) {
  return datePart(value) === todayKey();
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusChipColor(status) {
  const value = String(status || "").toLowerCase();
  if (["completed", "active", "present", "approved"].includes(value))
    return "success";
  if (["pending", "booked", "late entry", "half day"].includes(value))
    return "warning";
  if (["cancelled", "absent", "rejected", "critical"].includes(value))
    return "error";
  return "default";
}

function normalizeRoomType(value) {
  return String(value || "GENERAL")
    .trim()
    .toUpperCase();
}

function StatCard({ title, value, detail, icon: Icon, accent, gradient }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        background: gradient,
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 1,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 18px 42px ${accent}33, 0 6px 16px rgba(0,0,0,0.08)`,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: -16,
          right: -16,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.25,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.9)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 0.7,
              fontSize: "0.72rem",
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.18)",
            }}
          >
            <Icon sx={{ fontSize: 18, color: "#fff" }} />
          </Box>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            fontSize: { xs: "1.4rem", sm: "1.65rem", md: "1.85rem" },
          }}
        >
          {value}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 1,
          color: "rgba(255,255,255,0.85)",
          fontWeight: 700,
          fontSize: "0.82rem",
          lineHeight: 1.35,
        }}
      >
        {detail}
      </Typography>
    </Paper>
  );
}

function MiniStat({ label, value, color, bg }) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 90,
        textAlign: "center",
        px: 1,
        py: 1.25,
        borderRadius: 2,
        bgcolor: bg || `${color}14`,
        border: `1px solid ${color}28`,
      }}
    >
      <Typography
        variant="h5"
        sx={{ fontWeight: 950, color: color || palette.ink, lineHeight: 1 }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: palette.muted, fontWeight: 800 }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function SectionCard({ title, subtitle, gradient, action, children }) {
  return (
    <Paper
      elevation={0}
      sx={{ ...glassSx, p: 0, height: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          background: gradient,
          px: 1,
          py: 0.85,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "#fff", fontWeight: 900 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.82)", fontWeight: 700 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box
            sx={{
              "& .MuiButton-root": {
                color: "#fff",
                fontWeight: 800,
                bgcolor: "rgba(255,255,255,0.18)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
              },
            }}
          >
            {action}
          </Box>
        )}
      </Box>
      <Box sx={{ p: 0.9, bgcolor: "rgba(255,255,255,0.45)" }}>{children}</Box>
    </Paper>
  );
}

function BedOccupancyCard({
  label,
  occupied,
  total,
  patients,
  accent,
  gradient,
  onViewDetails,
}) {
  const percent = total ? Math.round((occupied / total) * 100) : 0;
  const available = total - occupied;
  const status =
    percent >= 90
      ? { label: "Full", color: "error" }
      : percent >= 70
        ? { label: "Busy", color: "warning" }
        : { label: "Available", color: "success" };

  return (
    <Paper
      elevation={0}
      sx={{
        ...glassSx,
        overflow: "hidden",
        borderRadius: 4,
        transition: "0.3s",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(0,0,0,.12)",
        },
      }}
    >
      <Box
        sx={{
          background: gradient,
          px: 1,
          py: 0.85,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,.22)",
              width: 42,
              height: 42,
            }}
          >
            <BedIcon />
          </Avatar>

          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 800 }}>
              {label}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,.85)", fontSize: 12 }}>
              Bed Occupancy
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={status.label}
          color={status.color}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: "rgba(255,255,255,.18)",
            color: "#fff",
          }}
        />
      </Box>

      <Box sx={{ p: 0.9 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1,
                color: accent,
              }}
            >
              {occupied}
              <Typography
                component="span"
                sx={{ fontSize: 12, color: "text.secondary", fontWeight: 600 }}
              >
                {" "}
                / {total}
              </Typography>
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Beds Occupied
            </Typography>
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: 18, color: accent }}>
            {percent}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 7,
            borderRadius: 14,
            mb: 1.2,
            bgcolor: "#e2e8f0",
            "& .MuiLinearProgress-bar": {
              bgcolor: accent,
              borderRadius: 20,
            },
          }}
        />

        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 1,
              textAlign: "center",
              bgcolor: "#EFF6FF",
              borderRadius: 2,
            }}
          >
            <Typography fontWeight={800}>{occupied}</Typography>
            <Typography variant="caption">Occupied</Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 1,
              textAlign: "center",
              bgcolor: "#F0FDF4",
              borderRadius: 2,
            }}
          >
            <Typography fontWeight={800}>{available}</Typography>
            <Typography variant="caption">Available</Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 1,
              textAlign: "center",
              bgcolor: "#FEFCE8",
              borderRadius: 2,
            }}
          >
            <Typography fontWeight={800}>{patients.length}</Typography>
            <Typography variant="caption">Patients</Typography>
          </Paper>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
          sx={{
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
          }}
          onClick={onViewDetails}
        >
          View Patient Details
        </Button>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [beds, setBeds] = useState([]);
  const [dischargeSummaries, setDischargeSummaries] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [hrSummary, setHrSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
  });
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [leaveRows, setLeaveRows] = useState([]);
  const [openPatients, setOpenPatients] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        patientsRes,
        appointmentsRes,
        lowStockRes,
        hrSummaryRes,
        attendanceRes,
        leavesRes,
        bedsRes,
        dischargeRes,
      ] = await Promise.allSettled([
        getPatients(),
        getAppointments(),
        getLowStockMedicines(),
        getHrDashboard(),
        getHrAttendance(),
        getHrLeaves(),
        api.get("/api/beds"),
        api.get("/api/discharge-summaries"),
      ]);

      setPatientsList(
        patientsRes.status === "fulfilled"
          ? patientsRes.value.data?.data || []
          : [],
      );
      setAppointments(
        appointmentsRes.status === "fulfilled"
          ? appointmentsRes.value.data || []
          : [],
      );
      setLowStockMedicines(
        lowStockRes.status === "fulfilled" ? lowStockRes.value.data || [] : [],
      );
      if (hrSummaryRes.status === "fulfilled")
        setHrSummary(hrSummaryRes.value.data || {});
      setAttendanceRows(
        attendanceRes.status === "fulfilled"
          ? attendanceRes.value.data || []
          : [],
      );
      setLeaveRows(
        leavesRes.status === "fulfilled" ? leavesRes.value.data || [] : [],
      );
      setBeds(bedsRes.status === "fulfilled" ? bedsRes.value.data || [] : []);
      setDischargeSummaries(
        dischargeRes.status === "fulfilled"
          ? dischargeRes.value.data || []
          : [],
      );
    } catch (err) {
      console.error("Dashboard load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchDashboardData();
    };
    loadData();
  }, []);

  const getPatientName = (id, appointment) => {
    if (appointment?.patientName) return appointment.patientName;
    const patient = patientsList.find((item) => String(item.id) === String(id));
    return patient?.name || "Unknown Patient";
  };

  const dashboardStats = useMemo(() => {
    const today = todayKey();
    const todayAppointments = appointments.filter(
      (appointment) =>
        isToday(appointment.date) &&
        String(appointment.status || "").toUpperCase() !== "CANCELLED",
    );

    const completedToday = todayAppointments.filter(
      (appointment) =>
        String(appointment.status || "").toUpperCase() === "COMPLETED",
    );
    const pendingToday = todayAppointments.filter((appointment) => {
      const status = String(appointment.status || "BOOKED").toUpperCase();
      return !["COMPLETED", "CANCELLED"].includes(status);
    });

    const now = new Date();
    const upcomingAppointments = [...appointments]
      .filter((appointment) => {
        if (
          !appointment.date ||
          String(appointment.status || "").toUpperCase() === "CANCELLED"
        )
          return false;
        const status = String(appointment.status || "BOOKED").toUpperCase();
        if (status === "COMPLETED") return false;
        return new Date(appointment.date) >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);

    const newPatientsToday = patientsList.filter(
      (patient) =>
        isToday(patient.createdAt) || isToday(patient.registrationDate),
    ).length;

    const todayAdmissions = beds.filter((bed) =>
      isToday(bed.admissionDate),
    ).length;
    const todayDischarges = dischargeSummaries.filter((summary) =>
      isToday(summary.dateOfDischarge),
    ).length;

    const presentToday = attendanceRows.filter((row) =>
      ["Present", "Late Entry"].includes(String(row[7] || "")),
    ).length;
    const absentToday = attendanceRows.filter(
      (row) => String(row[7] || "") === "Absent",
    ).length;
    const onLeaveToday = leaveRows.filter((leave) => {
      const start = datePart(leave[3]);
      const end = datePart(leave[4]);
      const managerStatus = String(leave[6] || "").toLowerCase();
      const hrStatus = String(leave[7] || "").toLowerCase();
      const approved = managerStatus === "approved" || hrStatus === "approved";
      return approved && start && end && today >= start && today <= end;
    }).length;

    const roomTypes = ["GENERAL", "ICU", "PRIVATE"];
    const bedOccupancy = roomTypes.map((roomType, index) => {
      const typeBeds = beds.filter(
        (bed) => normalizeRoomType(bed.roomType) === roomType,
      );
      const occupiedBeds = typeBeds.filter((bed) => bed.status === "OCCUPIED");
      const accents = [palette.blue, palette.red, palette.violet];
      const wardGradients = [gradients.blue, gradients.red, gradients.violet];
      return {
        label: roomType.charAt(0) + roomType.slice(1).toLowerCase(),
        roomType,
        total: typeBeds.length,
        occupied: occupiedBeds.length,
        accent: accents[index],
        gradient: wardGradients[index],
        patients: occupiedBeds.map((bed) => ({
          name: bed.patientName || "Unknown Patient",
          bedNo: bed.bedNumber || bed.bedNo || "-",
          doctor: bed.doctorName || bed.doctor || "N/A",
          admitDate: bed.admissionDate ? datePart(bed.admissionDate) : "",
          status: bed.patientStatus || bed.condition || "Stable",
        })),
      };
    });

    return {
      todayAppointments,
      completedToday,
      pendingToday,
      upcomingAppointments,
      newPatientsToday,
      todayOpd: todayAppointments.length,
      todayAdmissions,
      todayDischarges,
      presentToday,
      absentToday,
      onLeaveToday,
      bedOccupancy,
    };
  }, [
    appointments,
    patientsList,
    beds,
    dischargeSummaries,
    attendanceRows,
    leaveRows,
  ]);

  const totalEmployees = Number(hrSummary.totalEmployees || 0);

  const topMetrics = [
    {
      title: "Total Patients",
      value: patientsList.length,
      detail:
        dashboardStats.newPatientsToday > 0
          ? `${dashboardStats.newPatientsToday} new registrations`
          : "No new registrations",
      icon: PeopleIcon,
      accent: palette.blue,
      gradient: gradients.blue,
    },
    {
      title: "Today's Appts",
      value: dashboardStats.todayAppointments.length,
      detail: `${dashboardStats.completedToday.length} completed · ${dashboardStats.pendingToday.length} pending`,
      icon: TodayIcon,
      accent: palette.green,
      gradient: gradients.green,
    },
    {
      title: "Upcoming Visits",
      value: dashboardStats.upcomingAppointments.length,
      detail: `${appointments.length} total appointments`,
      icon: EventIcon,
      accent: palette.teal,
      gradient: gradients.teal,
    },
    {
      title: "Present Staff",
      value: dashboardStats.presentToday,
      detail: `${totalEmployees} staff present`,
      icon: GroupsIcon,
      accent: palette.violet,
      gradient: gradients.violet,
    },
    {
      title: "Pending Leave",
      value: hrSummary.pendingLeaves || 0,
      detail: `${dashboardStats.onLeaveToday} on leave today`,
      icon: EventAvailableIcon,
      accent: palette.amber,
      gradient: gradients.amber,
    },
    {
      title: "Low Stock",
      value: lowStockMedicines.length,
      detail: `${lowStockMedicines.length} items below threshold`,
      icon: WarningAmberIcon,
      accent: palette.red,
      gradient: gradients.red,
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        background: palette.page,
        minHeight: "100vh",
      }}
    >
      <Paper elevation={0} sx={{ ...glassSx, p: 0, mb: 2, overflow: "hidden" }}>
        <Box
          sx={{
            background: gradients.indigo,
            px: { xs: 2, md: 2.5 },
            py: { xs: 1.75, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.22)",
                color: "#fff",
                width: 48,
                height: 48,
              }}
            >
              <LocalHospitalIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950, color: "#fff" }}>
                Hospital Overview
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {formatTodayLabel()} · Live dashboard
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<AddCircleIcon />}
            component={Link}
            to="/appointments"
            variant="contained"
            sx={{
              alignSelf: { xs: "stretch", md: "center" },
              borderRadius: 2.5,
              height: 42,
              px: 2.5,
              fontWeight: 900,
              textTransform: "none",
              color: "#3730a3",
              bgcolor: "#fff",
              boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.92)" },
              ml: { md: "auto" },
            }}
          >
            Book Appointment
          </Button>
        </Box>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />}

      <Grid container spacing={1.25} alignItems="stretch" sx={{ mb: 2 }}>
        {topMetrics.map((metric) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 3, lg: 2, xl: 2 }}
            key={metric.title}
          >
            <StatCard {...metric} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.25} alignItems="stretch" sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Today's Activity"
            subtitle="OPD, admissions & discharges"
            gradient={gradients.cyan}
          >
            <Stack spacing={1.25}>
              {[
                {
                  label: "OPD Visits",
                  value: dashboardStats.todayOpd,
                  icon: LocalHospitalIcon,
                  color: palette.blue,
                  bg: "rgba(37,99,235,0.08)",
                },
                {
                  label: "IPD Admissions",
                  value: dashboardStats.todayAdmissions,
                  icon: LoginIcon,
                  color: palette.green,
                  bg: "rgba(5,150,105,0.08)",
                },
                {
                  label: "Discharges",
                  value: dashboardStats.todayDischarges,
                  icon: LogoutIcon,
                  color: palette.amber,
                  bg: "rgba(217,119,6,0.08)",
                },
              ].map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    p: 1,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: item.bg,
                    border: `1px solid ${item.color}22`,
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="center">
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: `${item.color}22`,
                        color: item.color,
                      }}
                    >
                      <item.icon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: palette.ink }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.muted, fontWeight: 700 }}
                      >
                        Today
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 950, color: item.color }}
                  >
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Today's Appointments"
            subtitle="Completion status for today"
            gradient={gradients.green}
          >
            <Grid container spacing={1}>
              {[
                {
                  label: "Total",
                  value: dashboardStats.todayAppointments.length,
                  color: palette.blue,
                  bg: "rgba(37,99,235,0.1)",
                },
                {
                  label: "Completed",
                  value: dashboardStats.completedToday.length,
                  color: palette.green,
                  bg: "rgba(5,150,105,0.1)",
                },
                {
                  label: "Pending",
                  value: dashboardStats.pendingToday.length,
                  color: palette.amber,
                  bg: "rgba(217,119,6,0.1)",
                },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 4 }} key={item.label}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 3,
                      textAlign: "center",
                      bgcolor: item.bg,
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 900, color: item.color }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: palette.muted, fontWeight: 700 }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={`${dashboardStats.todayAppointments.length} appointments`}
                color="primary"
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
              <Chip
                size="small"
                label={`${dashboardStats.completedToday.length} done`}
                color="success"
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
              <Chip
                size="small"
                label={`${dashboardStats.pendingToday.length} pending`}
                color="warning"
                sx={{ fontWeight: 800, borderRadius: 2 }}
              />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Staff Attendance"
            subtitle="Today's HR snapshot"
            gradient={gradients.violet}
          >
            <Grid container spacing={1}>
              {[
                {
                  label: "Total Employees",
                  value: totalEmployees,
                  color: palette.blue,
                  bg: "rgba(37,99,235,0.1)",
                },
                {
                  label: "Present Today",
                  value: dashboardStats.presentToday,
                  color: palette.green,
                  bg: "rgba(5,150,105,0.1)",
                },
                {
                  label: "Absent Today",
                  value: dashboardStats.absentToday,
                  color: palette.red,
                  bg: "rgba(220,38,38,0.1)",
                },
                {
                  label: "On Leave",
                  value: dashboardStats.onLeaveToday,
                  color: palette.amber,
                  bg: "rgba(217,119,6,0.1)",
                },
              ].map((item) => (
                <Grid size={{ xs: 6 }} key={item.label}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 0.85,
                      borderRadius: 3,
                      textAlign: "center",
                      bgcolor: item.bg,
                      border: `1px solid ${item.color}22`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 900,
                        color: item.color,
                        lineHeight: 1.1,
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: palette.muted, fontWeight: 700 }}
                    >
                      {item.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <SectionCard
            title="Upcoming Appointments"
            subtitle="Next scheduled visits"
            gradient={gradients.blue}
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                component={Link}
                to="/appointments"
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                View All
              </Button>
            }
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={tableHeadSx(gradients.blue)}>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardStats.upcomingAppointments.map(
                    (appointment, index) => (
                      <TableRow key={appointment.id || index} hover>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {formatTime(appointment.date)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {getPatientName(appointment.patientId, appointment)}
                        </TableCell>
                        <TableCell>{appointment.doctorName || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={appointment.status || "Booked"}
                            color={statusChipColor(
                              appointment.status || "Booked",
                            )}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {!dashboardStats.upcomingAppointments.length && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ py: 3, color: palette.muted, fontWeight: 800 }}
                      >
                        No upcoming appointments found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionCard
            title="Low Stock Medicines"
            subtitle="Pharmacy inventory alerts"
            gradient={gradients.red}
            action={
              <Button
                size="small"
                component={Link}
                to="/current-stock"
                endIcon={<ArrowForwardIcon />}
                sx={{ fontWeight: 800, textTransform: "none" }}
              >
                Stock
              </Button>
            }
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={tableHeadSx(gradients.red)}>
                  <TableRow>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockMedicines.slice(0, 6).map((medicine, index) => {
                    const stock = Number(
                      medicine.stockQuantity || medicine.stock || 0,
                    );
                    return (
                      <TableRow key={medicine.id || index} hover>
                        <TableCell sx={{ fontWeight: 800 }}>
                          {getMedicineLabel(medicine) || medicine.medicineName}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            color: stock <= 5 ? palette.red : palette.amber,
                          }}
                        >
                          {stock}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={stock <= 5 ? "Critical" : "Low Stock"}
                            color={stock <= 5 ? "error" : "warning"}
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!lowStockMedicines.length && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ py: 3, color: palette.muted, fontWeight: 800 }}
                      >
                        No low stock medicines.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {dashboardStats.bedOccupancy.map((ward) => (
          <Grid key={ward.roomType} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
            <BedOccupancyCard
              label={ward.label}
              occupied={ward.occupied}
              total={ward.total}
              patients={ward.patients}
              accent={ward.accent}
              gradient={ward.gradient}
              onViewDetails={() => {
                setSelectedWard(ward);
                setOpenPatients(true);
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openPatients}
        onClose={() => setOpenPatients(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            background: gradients.blue,
            color: "#fff",
            fontWeight: 800,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <BedIcon />
              <Typography variant="h6" fontWeight={800}>
                {selectedWard?.label} Patients
              </Typography>
            </Stack>
            <Chip
              label={`${selectedWard?.occupied || 0}/${selectedWard?.total || 0} Beds`}
              sx={{
                bgcolor: "rgba(255,255,255,.2)",
                color: "#fff",
                fontWeight: 700,
              }}
            />
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            mb={2}
            spacing={2}
          >
            <TextField
              size="small"
              placeholder="Search Patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 320 } }}
            />

            <Chip
              color="primary"
              label={`Patients : ${selectedWard?.patients?.length || 0}`}
            />
          </Stack>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#EFF6FF" }}>
                  <TableCell>Bed No</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Admit Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedWard?.patients
                  ?.filter((patient) =>
                    patient.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((patient, index) => (
                    <TableRow key={`${patient.bedNo}-${index}`} hover>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {patient.bedNo}
                        </Typography>
                      </TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.doctor || "Dr. Rao"}</TableCell>
                      <TableCell>
                        {patient.admitDate || "10-Jul-2026"}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={patient.status || "Stable"}
                          color={
                            patient.status === "Critical"
                              ? "error"
                              : patient.status === "Observation"
                                ? "warning"
                                : "success"
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setOpenPatients(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
