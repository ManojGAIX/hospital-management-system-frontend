import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Autocomplete,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import api from "../services/api";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// FullCalendar React
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

// Icons
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ListIcon from "@mui/icons-material/List";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PrintIcon from "@mui/icons-material/Print";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import QrCodeIcon from "@mui/icons-material/QrCode";

import TablePagination from "@mui/material/TablePagination";

import { formatDateTime } from "../utils/dateFormatter";

import {
  getAppointments,
  createAppointment,
  deleteAppointment,
  updateAppointment,
  getAppointmentReceipt,
} from "../api/appointmentApi";

import { getPatients } from "../api/patientApi";
import { getDoctors } from "../api/doctorApi";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Appointments() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [showSummary, setShowSummary] = useState(false);

  // Form State
  const [doctorName, setDoctorName] = useState("");
  // const [date, setDate] = useState("");
  const [date, setDate] = useState(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [status, setStatus] = useState("BOOKED");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [visitType, setVisitType] = useState("New Patient");
  const [editId, setEditId] = useState(null);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [splitPayment, setSplitPayment] = useState({
    cashAmount: "",
    upiAmount: "",
    cardAmount: "",
  });

  const [viewMode, setViewMode] = useState("list"); // list or calendar
  const [selectedCalendarApp, setSelectedCalendarApp] = useState(null);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [configs, setConfigs] = useState([]);

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadDoctors();
    loadConfigs();
  }, []);
  useEffect(() => {
    const incomingPatient = location.state?.patient;
    if (!incomingPatient?.id || !patients.length) return;
    setSelectedPatientId(String(incomingPatient.id));
    setVisitType("New Patient");
    window.history.replaceState({}, document.title);
  }, [location.state, patients]);

  const loadConfigs = async () => {
    try {
      const res = await api.get("/api/configs/category/OPD");

      setConfigs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));

    setPage(0);
  };

  const isFollowUp = visitType === "Follow-up";
  const registrationFee = isFollowUp
    ? 0
    : Number(
        configs.find((c) => c.configKey === "REGISTRATION_FEE")?.configValue ||
          0,
      );

  const consultationFee = isFollowUp
    ? 0
    : Number(
        configs.find((c) => c.configKey === "CONSULTATION_FEE")?.configValue ||
          0,
      );

  const total = registrationFee + consultationFee;
  const splitPaymentTotal = Object.values(splitPayment).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  const upiId = import.meta.env.VITE_UPI_ID || "8553839908@upi";
  const upiName = import.meta.env.VITE_UPI_NAME || "Madhav Hospital";

  const handlePrintReceipt = async (appointmentId) => {
    try {
      const res = await getAppointmentReceipt(appointmentId);

      generateAppointmentReceipt(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load receipt", "error");
    }
  };

  // ================= LOAD APPOINTMENTS =================
  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOAD PATIENTS =================
  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= LOAD DOCTORS =================
  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= GET PATIENT NAME =================
  const getPatientName = (id, app) => {
    if (app?.patientName) return app.patientName;
    const patient = patients.find((p) => String(p.id) === String(id));

    return patient ? patient.name : "";
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (!selectedPatientId || !doctorName || !date || !status) {
      showNotification("Please fill all fields", "warning");

      return;
    }

    if (paymentMode === "SPLIT" && Math.abs(splitPaymentTotal - total) > 0.01) {
      showNotification(
        "Split payment total must equal the appointment fee.",
        "warning",
      );
      return;
    }

    const payload = {
      doctorName,
      date,
      status,
      patientId: Number(selectedPatientId),
      visitType,
      paymentMode,
      cashAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.cashAmount || 0) : 0,
      upiAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.upiAmount || 0) : 0,
      cardAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.cardAmount || 0) : 0,
    };

    try {
      if (editId) {
        await updateAppointment(editId, payload);
        showNotification("Appointment updated successfully!", "success");
      } else {
        const response = await createAppointment(payload);
        generateAppointmentReceipt(response.data);
        showNotification("Appointment booked successfully!", "success");
      }

      resetForm();
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  // ================= EDIT =================
  const handleEditClick = (app) => {
    setEditId(app.id);
    setDoctorName(app.doctorName);
    setDate(app.date);
    setStatus(app.status);
    setSelectedPatientId(String(app.patientId));
    setVisitType(app.visitType || "New Patient");
    setPaymentMode(app.paymentMode || "CASH");
    setSplitPayment({
      cashAmount: app.cashAmount || "",
      upiAmount: app.upiAmount || "",
      cardAmount: app.cardAmount || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= RESET =================
  const resetForm = () => {
    setEditId(null);
    setDoctorName("");
    setDate(new Date().toISOString().slice(0, 16));
    setStatus("");
    setSelectedPatientId("");
    setVisitType("New Patient");
    setPaymentMode("CASH");
    setSplitPayment({ cashAmount: "", upiAmount: "", cardAmount: "" });
  };

  // ================= PRINT TOKEN =================
  const handlePrintToken = async (appointmentId) => {
    try {
      const res = await getAppointmentReceipt(appointmentId);
      generateAppointmentToken(res.data);
    } catch (err) {
      console.error(err);
      showNotification("Failed to generate token", "error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (window.confirm("Delete this appointment?")) {
      try {
        await deleteAppointment(id);
        loadAppointments();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // ================= STATUS COLOR =================
  const getStatusColor = (status) => {
    const s = status?.toUpperCase();

    if (s === "BOOKED" || s === "PENDING") return "warning";
    if (s === "COMPLETED") return "success";
    if (s === "CANCELLED") return "error";

    return "info";
  };

  // FILTERED DATA

  const filteredAppointments = appointments.filter((app) => {
    const patientName = getPatientName(app.patientId)?.toLowerCase() || "";

    const doctorName = app.doctorName?.toLowerCase() || "";

    const prn = `prn${String(app.patientId).padStart(4, "0")}`;

    const searchText = search.toLowerCase();

    const matchesSearch =
      patientName.includes(searchText) ||
      doctorName.includes(searchText) ||
      prn.includes(searchText) ||
      String(app.patientId).includes(searchText) ||
      String(app.patientId).padStart(4, "0").includes(searchText);

    const matchesDoctor = !doctorFilter || app.doctorName === doctorFilter;

    return matchesSearch && matchesDoctor;
  });

  // Custom Soft Badge Styles
  const getBadgeStyles = (status) => {
    const s = status?.toLowerCase() || "booked";
    switch (s) {
      case "completed":
        return {
          bg: "rgba(34, 197, 94, 0.15)",
          text: "#15803d",
          border: "rgba(34, 197, 94, 0.3)",
        };
      case "cancelled":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          text: "#b91c1c",
          border: "rgba(239, 68, 68, 0.3)",
        };
      default: // Booked / Pending
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          text: "#b45309",
          border: "rgba(245, 158, 11, 0.3)",
        };
    }
  };

  const generateAppointmentReceipt = (payment) => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = "/logo.png";

    img.onload = () => {
      // =====================================
      // HEADER
      // =====================================

      doc.addImage(img, "PNG", 12, 8, 185, 42);

      doc.setDrawColor(30, 58, 138);
      doc.line(10, 54, 200, 54);

      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");

      doc.text("OPD PAYMENT RECEIPT", 105, 66, {
        align: "center",
      });

      let y = 82;

      // =====================================
      // PATIENT DETAILS
      // =====================================

      doc.setFontSize(11);

      doc.setFont(undefined, "bold");
      doc.text("Patient Name", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(payment.patientName || "-", 60, y);

      doc.setFont(undefined, "bold");
      doc.text("Doctor", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(payment.doctorName || "-", 160, y);

      y += 10;

      doc.setFont(undefined, "bold");
      doc.text("PRN", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(`PRN${String(payment.patientId).padStart(4, "0")}`, 60, y);

      doc.setFont(undefined, "bold");
      doc.text("Visit No", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(payment.visitNumber || "-", 160, y);

      y += 10;

      doc.setFont(undefined, "bold");
      doc.text("Date", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(new Date(payment.paymentDate).toLocaleString(), 160, y);

      // =====================================
      // CHARGES TABLE
      // =====================================

      autoTable(doc, {
        startY: y + 15,

        head: [["#", "DESCRIPTION", "AMOUNT (₹)"]],

        body: [
          [1, "Registration Fee", payment.registrationFee?.toFixed(2)],
          [2, "Consultation Fee", payment.consultationFee?.toFixed(2)],
        ],

        foot: [
          [
            "",
            "TOTAL",
            (
              Number(payment.registrationFee || 0) +
              Number(payment.consultationFee || 0)
            ).toFixed(2),
          ],
        ],

        theme: "grid",

        headStyles: {
          fillColor: [30, 58, 138],
        },

        footStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      // =====================================
      // FOOTER
      // =====================================

      const finalY = doc.lastAutoTable.finalY + 30;

      doc.line(130, finalY, 190, finalY);

      doc.setFont(undefined, "bold");
      doc.text("Authorized Signature", 140, finalY + 10);

      doc.save(`OPD_Receipt_${payment.visitNumber}.pdf`);
    };
  };

  const generateAppointmentToken = (payment) => {
    // 80mm width, 140mm height (Thermal slip format)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 140],
    });

    // Hospital Header
    doc.setFontSize(13);
    doc.setTextColor(30, 58, 138); // Deep Blue
    doc.setFont(undefined, "bold");
    doc.text("MADHAV HOSPITAL", 40, 12, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, "normal");
    doc.text("OPD Token Slip", 40, 17, { align: "center" });

    // Decorative Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(5, 20, 75, 20);

    // Queue / Token Number Box
    doc.setFillColor(240, 247, 255); // light blue background
    doc.rect(10, 24, 60, 24, "F");

    doc.setFontSize(9);
    doc.setTextColor(3, 105, 161); // sky blue text
    doc.setFont(undefined, "bold");
    doc.text("QUEUE / TOKEN NUMBER", 40, 30, { align: "center" });

    doc.setFontSize(28);
    doc.setTextColor(30, 58, 138); // deep blue text
    doc.setFont(undefined, "bold");
    doc.text(String(payment.queueNumber || "N/A"), 40, 43, { align: "center" });

    // Details section
    let y = 56;
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);

    const drawDetailRow = (label, value) => {
      doc.setFont(undefined, "bold");
      doc.text(label, 8, y);
      doc.setFont(undefined, "normal");
      doc.text(String(value), 32, y);
      y += 7.5;
    };

    drawDetailRow(
      "Patient PRN:",
      `PRN${String(payment.patientId).padStart(4, "0")}`,
    );
    drawDetailRow("Name:", payment.patientName || "-");
    drawDetailRow("Doctor:", payment.doctorName || "-");
    drawDetailRow("Visit Type:", payment.visitType || "New Patient");
    drawDetailRow(
      "Date & Time:",
      formatDateTime(payment.paymentDate || new Date()),
    );
    drawDetailRow("Print Date:", new Date().toLocaleDateString("en-IN"));

    // Total Fee Info
    doc.line(5, y - 2, 75, y - 2);
    y += 4;
    doc.setFont(undefined, "bold");
    doc.setFontSize(9.5);
    doc.text("Total Paid:", 8, y);
    doc.text(
      `₹${(Number(payment.registrationFee || 100) + Number(payment.consultationFee || 500)).toFixed(2)}`,
      32,
      y,
    );

    y += 8;
    // UPI QR Code image representation (scan to verify / checkout)
    const upiUrl = `upi://pay?pa=${upiId}&pn=${upiName}&am=${Number(payment.registrationFee || 100) + Number(payment.consultationFee || 500)}&cu=INR&tn=Token_${payment.visitNumber}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(upiUrl)}`;

    const qrImg = new Image();
    qrImg.src = qrCodeUrl;
    qrImg.crossOrigin = "Anonymous";

    qrImg.onload = () => {
      doc.addImage(qrImg, "PNG", 28, y, 22, 22);

      // Footer Note
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setFont(undefined, "italic");
      doc.text("Thank you for choosing Madhav Hospital.", 40, y + 26, {
        align: "center",
      });
      doc.text("Please wait for your queue number.", 40, y + 30, {
        align: "center",
      });

      doc.save(
        `Token_${payment.queueNumber || "N/A"}_${payment.patientName || "Patient"}.pdf`,
      );
    };

    qrImg.onerror = () => {
      // Fallback if image load fails (e.g. no network)
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.setFont(undefined, "italic");
      doc.text("Thank you for choosing Madhav Hospital.", 40, y + 8, {
        align: "center",
      });
      doc.text("Please wait for your queue number.", 40, y + 12, {
        align: "center",
      });

      doc.save(
        `Token_${payment.queueNumber || "N/A"}_${payment.patientName || "Patient"}.pdf`,
      );
    };
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayApps = appointments.filter((a) => {
    if (!a.date) return false;
    return a.date.startsWith(todayStr) && a.status !== "CANCELLED";
  });
  const todayTotal = todayApps.reduce((sum, a) => {
    const reg = Number(a.registrationFee || 0);
    const cons = Number(a.consultationFee || 0);
    return sum + reg + cons;
  }, 0);
  const todayCash = todayApps
    .filter((a) => a.paymentMode === "CASH")
    .reduce((sum, a) => {
      const reg = Number(a.registrationFee || 0);
      const cons = Number(a.consultationFee || 0);
      return sum + reg + cons;
    }, 0);
  const todayUpi = todayApps
    .filter((a) => a.paymentMode === "UPI")
    .reduce((sum, a) => {
      const reg = Number(a.registrationFee || 0);
      const cons = Number(a.consultationFee || 0);
      return sum + reg + cons;
    }, 0);

  return (
    <Box
      sx={{
        padding: "6px",
        backgroundColor: "#f0f7ff",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <IconButton onClick={() => setShowSummary(!showSummary)}>
          {showSummary ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      {/* Small Payment Summary Tiles at the top */}
      <Collapse in={showSummary}>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          {/* Card 1 */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              color: "#fff",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S OPD BILL TOTAL
            </Typography>

            <Typography variant="h6" fontWeight={800}>
              ₹{todayTotal.toFixed(2)}
            </Typography>
          </Paper>

          {/* Card 2 */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
              color: "#fff",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S CASH TOTAL
            </Typography>

            <Typography variant="h6" fontWeight={800}>
              ₹{todayCash.toFixed(2)}
            </Typography>
          </Paper>

          {/* Card 3 */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
              color: "#fff",
              borderRadius: "12px",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S UPI TOTAL
            </Typography>

            <Typography variant="h6" fontWeight={800}>
              ₹{todayUpi.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
      </Collapse>

      {/* ================= FORM ================= */}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: "1px solid #dbe4ee",
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Doctor</InputLabel>
              <Select
                value={doctorName}
                label="Select Doctor"
                onChange={(e) => setDoctorName(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- Select Doctor --</em>
                </MenuItem>
                {doctors.map((doc) => (
                  <MenuItem key={doc.id} value={doc.name}>
                    {doc.name} ({doc.specialization})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="Appointment Date & Time"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="BOOKED">BOOKED</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Visit Type</InputLabel>
              <Select
                value={visitType}
                label="Visit Type"
                onChange={(e) => setVisitType(e.target.value)}
              >
                <MenuItem value="New Patient">New Patient</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={paymentMode}
                label="Payment Mode"
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="SPLIT">Split Payment</MenuItem>
                <MenuItem value="PAY_LATER">Charge to Visit Bill</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Autocomplete
              options={patients}
              getOptionLabel={(option) =>
                `${option.patientCode || ""} - ${option.name || ""}`
              }
              value={
                patients.find(
                  (p) => String(p.id) === String(selectedPatientId),
                ) || null
              }
              onChange={(event, newValue) =>
                setSelectedPatientId(newValue ? String(newValue.id) : "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  label="Search Patient"
                  placeholder="Type Patient Name / PRN"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
        </Grid>
        {paymentMode === "SPLIT" && (
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Cash Amount"
                value={splitPayment.cashAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    cashAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="UPI Amount"
                value={splitPayment.upiAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    upiAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Card Amount"
                value={splitPayment.cardAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    cardAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
                helperText={`Split total: ₹${splitPaymentTotal.toFixed(2)} / ₹${total.toFixed(2)}`}
              />
            </Grid>
          </Grid>
        )}
        {/* ================= FEE ESTIMATION & QR SCANNER & ACTION BUTTONS ================= */}
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px dashed rgba(0, 0, 0, 0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {/* Fee Breakdown Estimation */}
          <Box sx={{ minWidth: "280px" }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                fontWeight: "800",
                mb: 1,
                letterSpacing: "0.5px",
              }}
            >
              OPD FEE ESTIMATION (BEFORE BOOKING)
            </Typography>
            <Box sx={{ width: "100%", maxWidth: "320px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.5,
                }}
              >
                <Typography sx={{ color: "text.primary", fontSize: "0.85rem" }}>
                  Registration Fee
                </Typography>
                <Typography sx={{ fontWeight: "700", fontSize: "0.85rem" }}>
                  ₹{registrationFee.toFixed(2)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.5,
                }}
              >
                <Typography sx={{ color: "text.primary", fontSize: "0.85rem" }}>
                  Consultation Fee
                </Typography>
                <Typography sx={{ fontWeight: "700", fontSize: "0.85rem" }}>
                  ₹{consultationFee.toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: "rgba(0,0,0,0.06)" }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "800",
                    color: "#1e3a8a",
                    fontSize: "1.05rem",
                  }}
                >
                  Total Amount
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "900",
                    color: "#1e3a8a",
                    fontSize: "1.05rem",
                  }}
                >
                  ₹{total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Dynamic Payment Details Panel */}
          {total > 0 && paymentMode === "UPI" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                p: 2,
                borderRadius: "16px",
                backgroundColor: "rgba(240, 247, 255, 0.95)",
                border: "1px solid rgba(191, 219, 254, 0.6)",
                boxShadow: "0 4px 12px rgba(30,64,175,0.04)",
              }}
            >
              <Box
                component="img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(
                  `upi://pay?pa=${upiId}&pn=${upiName}&am=${total}&cu=INR&tn=OPD_Booking`,
                )}`}
                alt="Payment Scanner"
                sx={{
                  width: 95,
                  height: 95,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  p: 0.75,
                  border: "1px solid rgba(226,232,240,1)",
                }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "800",
                    color: "#1e3a8a",
                    fontSize: "0.9rem",
                  }}
                >
                  Direct Scan & Pay
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mt: 0.25,
                  }}
                >
                  Scan to pay OPD charges securely.
                </Typography>
                <Chip
                  label={`₹${total.toFixed(2)}`}
                  size="small"
                  sx={{
                    mt: 1.2,
                    backgroundColor: "#10b981",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "0.8rem",
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          )}

          {total > 0 && paymentMode === "CASH" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                p: 2,
                borderRadius: "16px",
                backgroundColor: "rgba(240, 253, 244, 0.95)",
                border: "1px solid rgba(187, 247, 208, 0.6)",
                boxShadow: "0 4px 12px rgba(22,163,74,0.04)",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid rgba(226,232,240,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PaymentsIcon sx={{ fontSize: 48, color: "#16a34a" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "800",
                    color: "#15803d",
                    fontSize: "0.9rem",
                  }}
                >
                  Cash Payment
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mt: 0.25,
                  }}
                >
                  Collect cash at counter.
                </Typography>
                <Chip
                  label={`Collect: ₹${total.toFixed(2)}`}
                  size="small"
                  sx={{
                    mt: 1.2,
                    backgroundColor: "#16a34a",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "0.8rem",
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          )}

          {total > 0 && paymentMode === "CARD" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                p: 2,
                borderRadius: "16px",
                backgroundColor: "rgba(254, 242, 242, 0.95)",
                border: "1px solid rgba(254, 202, 202, 0.6)",
                boxShadow: "0 4px 12px rgba(220,38,38,0.04)",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid rgba(226,232,240,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CreditCardIcon sx={{ fontSize: 48, color: "#dc2626" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "800",
                    color: "#991b1b",
                    fontSize: "0.9rem",
                  }}
                >
                  Card Payment
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mt: 0.25,
                  }}
                >
                  Swipe card at POS terminal.
                </Typography>
                <Chip
                  label={`Swipe: ₹${total.toFixed(2)}`}
                  size="small"
                  sx={{
                    mt: 1.2,
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "0.8rem",
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          )}

          {total > 0 && paymentMode === "PAY_LATER" && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2.5,
                p: 2,
                borderRadius: "16px",
                backgroundColor: "rgba(241, 245, 249, 0.95)",
                border: "1px solid rgba(203, 213, 225, 0.6)",
                boxShadow: "0 4px 12px rgba(100,116,139,0.04)",
              }}
            >
              <Box
                sx={{
                  p: 1,
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid rgba(226,232,240,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HourglassEmptyIcon sx={{ fontSize: 48, color: "#64748b" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: "800",
                    color: "#475569",
                    fontSize: "0.9rem",
                  }}
                >
                  Charge to Visit Bill
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                    mt: 0.25,
                  }}
                >
                  Will be added to main invoice.
                </Typography>
                <Chip
                  label={`Pay Later: ₹${total.toFixed(2)}`}
                  size="small"
                  sx={{
                    mt: 1.2,
                    backgroundColor: "#64748b",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "0.8rem",
                    px: 0.5,
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: "12px",
              ml: "auto",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={editId ? <EditIcon /> : <AddCircleIcon />}
              sx={{
                height: 52,
                minWidth: 180,
                px: 4,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: editId
                  ? "linear-gradient(135deg, #06B6D4, #1E40AF)"
                  : "linear-gradient(135deg, #1E40AF, #06B6D4)",

                color: "#fff",

                boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
                  background: editId
                    ? "linear-gradient(135deg, #06B6D4, #1E40AF)"
                    : "linear-gradient(135deg, #10B981, #059669)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {editId ? "Update Appointment" : "Book Appointment"}
            </Button>
            {editId && (
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<DeleteIcon />}
                sx={{
                  height: 52,
                  minWidth: 140,
                  px: 3,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,

                  color: "#EF4444",
                  borderColor: "#EF4444",
                  borderWidth: 2,

                  transition: "all 0.3s ease",

                  "&:hover": {
                    backgroundColor: "#FEF2F2",
                    borderColor: "#DC2626",
                    color: "#DC2626",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* ================= TABLE/CALENDAR HEADER ================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <EventIcon sx={{ color: "#1e3a8a", fontSize: "1.8rem" }} />

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1e3a8a",
              mr: 2,
            }}
          >
            Appointment Registry
          </Typography>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, nextView) => {
              if (nextView !== null) setViewMode(nextView);
            }}
            size="small"
            sx={{
              backgroundColor: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              "& .MuiToggleButtonGroup-grouped": {
                border: 0,
                px: 2,
                py: 0.6,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "600",
                "&.Mui-selected": {
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  "&:hover": {
                    backgroundColor: "#dbeafe",
                  },
                },
                "&:not(:first-of-type)": {
                  borderRadius: "8px",
                },
                "&:first-of-type": {
                  borderRadius: "8px",
                },
              },
            }}
          >
            <ToggleButton value="list" sx={{ gap: 1 }}>
              <ListIcon fontSize="small" />
              List View
            </ToggleButton>
            <ToggleButton value="calendar" sx={{ gap: 1 }}>
              <CalendarTodayIcon fontSize="small" />
              Calendar View
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {viewMode === "list" && (
            <TextField
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,

                  backgroundColor: "#fff",

                  "&:hover fieldset": {
                    borderColor: "#3B82F6",
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: "#1E40AF",
                  },
                },
              }}
              size="small"
              placeholder="Search by Patient Name or PRN Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
            />
          )}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter Doctor</InputLabel>

            <Select
              value={doctorFilter}
              label="Filter Doctor"
              onChange={(e) => setDoctorFilter(e.target.value)}
              sx={{ backgroundColor: "#fff", borderRadius: 3 }}
            >
              <MenuItem value="">All Doctors</MenuItem>

              {doctors.map((doc) => (
                <MenuItem key={doc.id} value={doc.name}>
                  {doc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* ================= VIEW RENDERING ================= */}

      {viewMode === "list" ? (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            border: "1px solid #e0e6ed",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          }}
        >
          <Table size="small">
            <TableHead
              sx={{
                background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  SI No
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  PATIENT INFO
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  PATIENT NAME
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  VISIT TYPE
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  DOCTOR
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  DATE & TIME
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  PAY MODE
                </TableCell>

                <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                  STATUS
                </TableCell>

                <TableCell
                  sx={{ fontWeight: "bold", color: "#fff" }}
                  align="center"
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredAppointments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((app, index) => {
                  const badge = getBadgeStyles(app.status);
                  return (
                    <TableRow
                      key={app.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "#f8faff",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "500", textAlign: "center" }}
                      >
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "#1e3a8a",
                        }}
                      >
                        <div>
                          {app.patientId
                            ? `PRN${String(app.patientId).padStart(4, "0")}`
                            : "N/A"}
                        </div>
                        <Chip
                          label={`Queue: ${app.queueNumber || "N/A"}`}
                          size="small"
                          sx={{
                            mt: 0.5,
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            fontWeight: "bold",
                            fontSize: "0.7rem",
                            height: "18px",
                            "& .MuiChip-label": { px: 1 },
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600 }}>
                        {getPatientName(app.patientId, app)}
                      </TableCell>

                      <TableCell sx={{ verticalAlign: "middle" }}>
                        <Chip
                          label={app.visitType || "New Patient"}
                          size="small"
                          variant="outlined"
                          color={
                            app.visitType === "Follow-up"
                              ? "secondary"
                              : "primary"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: "20px",
                          }}
                        />
                      </TableCell>

                      <TableCell>{app.doctorName}</TableCell>

                      <TableCell>{formatDateTime(app.date)}</TableCell>

                      <TableCell sx={{ verticalAlign: "middle" }}>
                        <Chip
                          label={
                            app.paymentMode === "PAY_LATER"
                              ? "PAY LATER"
                              : app.paymentMode || "CASH"
                          }
                          size="small"
                          color={
                            app.paymentMode === "UPI"
                              ? "info"
                              : app.paymentMode === "CARD"
                                ? "primary"
                                : app.paymentMode === "PAY_LATER"
                                  ? "default"
                                  : "success"
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: "20px",
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            py: 0.5,
                            px: 1.5,
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            display: "inline-block",
                            textTransform: "uppercase",
                          }}
                        >
                          {app.status || "BOOKED"}
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip title="Edit Appointment">
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(app)}
                              sx={{
                                backgroundColor: "#0ea5e9",
                                color: "white",
                                p: 0.5,
                                "&:hover": {
                                  backgroundColor: "#0284c7",
                                },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Print Token">
                            <IconButton
                              onClick={() => handlePrintToken(app.id)}
                              sx={{
                                backgroundColor: "#8b5cf6",
                                color: "white",
                                p: 0.5,
                                "&:hover": {
                                  backgroundColor: "#7c3aed",
                                },
                              }}
                            >
                              <ReceiptLongIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Print Receipt">
                            <IconButton
                              onClick={() => handlePrintReceipt(app.id)}
                              sx={{
                                backgroundColor: "#16a34a",
                                color: "white",
                                p: 0.5,
                                "&:hover": {
                                  backgroundColor: "#15803d",
                                },
                              }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Appointment">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleDelete(app.id)}
                              sx={{
                                backgroundColor: "#fef2f2",
                                p: 0.5,
                                "&:hover": {
                                  backgroundColor: "#fee2e2",
                                },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      ) : (
        <Paper
          sx={{
            p: 3,
            borderRadius: "16px",
            border: "1px solid #e0e6ed",
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            "& .fc": {
              fontFamily: "inherit",
            },
            "& .fc-button": {
              backgroundColor: "#1e3a8a",
              borderColor: "transparent",
              textTransform: "capitalize",
              fontWeight: "bold",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#1e40af",
              },
              "&.fc-button-active": {
                backgroundColor: "#3b82f6 !important",
              },
            },
            "& .fc-col-header-cell": {
              backgroundColor: "#f8fafc",
              py: 1.5,
            },
            "& .fc-event": {
              borderRadius: "6px",
              padding: "2px 4px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              cursor: "pointer",
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridDay"
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            themeSystem="standard"
            height="auto"
            allDaySlot={false}
            events={filteredAppointments.map((app) => {
              const patientName = getPatientName(app.patientId, app);
              const startDate = new Date(app.date);
              const endDate = new Date(startDate.getTime() + 15 * 60 * 1000); // 15 mins

              let color = "#3b82f6";
              if (app.status === "COMPLETED") color = "#10b981";
              if (app.status === "CANCELLED") color = "#ef4444";
              if (app.status === "PENDING") color = "#f59e0b";

              return {
                id: String(app.id),
                title: `${patientName} - Queue: ${app.queueNumber || "N/A"} (${app.doctorName})`,
                start: app.date,
                end: endDate.toISOString(),
                backgroundColor: color,
                borderColor: "transparent",
                extendedProps: app,
              };
            })}
            eventClick={(info) => {
              setSelectedCalendarApp(info.event.extendedProps);
              setCalendarModalOpen(true);
            }}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: "short",
              hour12: true,
            }}
            slotLabelFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              meridiem: "short",
            }}
            slotDuration="00:15:00"
          />
        </Paper>
      )}

      {/* ================= CALENDAR DETAILS DIALOG ================= */}
      <Dialog
        open={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "800", color: "#1e3a8a", pb: 1 }}>
          Appointment Details
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          {selectedCalendarApp && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Patient Name:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {getPatientName(
                    selectedCalendarApp.patientId,
                    selectedCalendarApp,
                  )}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Patient PRN / ID:
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", color: "#1e3a8a" }}
                >
                  PRN{String(selectedCalendarApp.patientId).padStart(4, "0")}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Queue / Token No:
                </Typography>
                <Chip
                  label={`Queue: ${selectedCalendarApp.queueNumber || "N/A"}`}
                  size="small"
                  sx={{
                    backgroundColor: "#e0f2fe",
                    color: "#0369a1",
                    fontWeight: "bold",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Visit Type:
                </Typography>
                <Chip
                  label={selectedCalendarApp.visitType || "New Patient"}
                  size="small"
                  variant="outlined"
                  color={
                    selectedCalendarApp.visitType === "Follow-up"
                      ? "secondary"
                      : "primary"
                  }
                  sx={{ fontWeight: "600" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Doctor:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {selectedCalendarApp.doctorName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Date & Time:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {formatDateTime(selectedCalendarApp.date)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Status:
                </Typography>
                <Chip
                  label={selectedCalendarApp.status || "BOOKED"}
                  size="small"
                  color={getStatusColor(selectedCalendarApp.status)}
                  sx={{ fontWeight: "bold" }}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, px: 3, pb: 2 }}>
          {selectedCalendarApp && (
            <>
              <Tooltip title="Print Token">
                <Button
                  variant="outlined"
                  size="small"
                  color="info"
                  onClick={() => {
                    handlePrintToken(selectedCalendarApp.id);
                    setCalendarModalOpen(false);
                  }}
                  startIcon={<ReceiptLongIcon />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  Token
                </Button>
              </Tooltip>
              <Tooltip title="Print Receipt">
                <Button
                  variant="outlined"
                  size="small"
                  color="success"
                  onClick={() => {
                    handlePrintReceipt(selectedCalendarApp.id);
                    setCalendarModalOpen(false);
                  }}
                  startIcon={<PrintIcon />}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  Receipt
                </Button>
              </Tooltip>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  handleEditClick(selectedCalendarApp);
                  setCalendarModalOpen(false);
                }}
                startIcon={<EditIcon />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: "bold",
                  backgroundColor: "#0ea5e9",
                  "&:hover": { backgroundColor: "#0284c7" },
                }}
              >
                Edit
              </Button>
            </>
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => setCalendarModalOpen(false)}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
              color: "text.secondary",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() =>
          setNotification({
            ...notification,
            open: false,
          })
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
