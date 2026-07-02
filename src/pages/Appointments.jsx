import React, { useEffect, useState } from "react";
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
} from "@mui/material";

import api from "../services/api";

// Icons
import EventIcon from "@mui/icons-material/Event";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";

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

import PrintIcon from "@mui/icons-material/Print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Form State
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [editId, setEditId] = useState(null);

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

  const loadConfigs = async () => {
    try {
      const res = await api.get("/api/configs/category/OPD",);

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

  const registrationFee = Number(
    configs.find((c) => c.configKey === "REGISTRATION_FEE")?.configValue || 0,
  );

  const consultationFee = Number(
    configs.find((c) => c.configKey === "CONSULTATION_FEE")?.configValue || 0,
  );

  const total = registrationFee + consultationFee;

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

    const payload = {
      doctorName,
      date,
      status,
      patientId: Number(selectedPatientId),
    };

    console.log("Payload:", payload);

    try {
      if (editId) {
        await updateAppointment(editId, payload);
        showNotification("Appointment updated successfully!", "success");
      } else {
        const response = await createAppointment(payload);
        console.log(response.data);
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= RESET =================
  const resetForm = () => {
    setEditId(null);
    setDoctorName("");
    setDate("");
    setStatus("");
    setSelectedPatientId("");
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

  return (
    <Box
      sx={{
        padding: "6px",
        backgroundColor: "#f0f7ff",
        minHeight: "100vh",
      }}
    >
      {/* ================= FORM ================= */}

      <Paper
        sx={{
          p: 3,
          borderRadius: 4,

          background: "rgba(255,255,255,0.75)",

          backdropFilter: "blur(12px)",

          border: "1px solid rgba(255,255,255,0.4)",

          boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* ================= DOCTOR DROPDOWN ================= */}

          <FormControl sx={{ flex: 1, minWidth: "250px" }}>
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

          {/* ================= DATE ================= */}

          <TextField
            type="datetime-local"
            label="Appointment Date & Time"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              flex: 1,
              minWidth: "200px",
            }}
          />

          {/* ================= STATUS ================= */}

          <FormControl sx={{ flex: 1, minWidth: "200px" }}>
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

          {/* ================= PATIENT DROPDOWN ================= */}

          <FormControl
            sx={{
              flex: 1,
              minWidth: 300,
            }}
          >
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
              onChange={(event, newValue) => {
                setSelectedPatientId(newValue ? String(newValue.id) : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type Patient Name / PRN"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </FormControl>

          {/* ================= BUTTONS ================= */}

          <Box
            sx={{
              display: "flex",
              gap: "10px",
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

      {/* ================= TABLE HEADER ================= */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <EventIcon sx={{ color: "#1e3a8a" }} />

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1e3a8a",
            }}
          >
            Appointment Registry
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter Doctor</InputLabel>

            <Select
              value={doctorFilter}
              label="Filter Doctor"
              onChange={(e) => setDoctorFilter(e.target.value)}
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

      {/* ================= TABLE ================= */}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", border: "1px solid #e0e6ed" }}
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
                PATIENT ID
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                PATIENT NAME
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                DOCTOR
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                DATE & TIME
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
                    <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: "#1e3a8a",
                      }}
                    >
                      {app.patientId
                        ? `PRN${String(app.patientId).padStart(4, "0")}`
                        : "N/A"}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      {getPatientName(app.patientId, app)}
                    </TableCell>

                    <TableCell>{app.doctorName}</TableCell>

                    <TableCell>{formatDateTime(app.date)}</TableCell>

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
                        <Tooltip title="Edit Doctor">
                          <IconButton
                            size="small" // ACTION: Shrinks the button padding container
                            onClick={() => handleEditClick(app)}
                            sx={{
                              backgroundColor: "#0ea5e9",
                              color: "white",
                              p: 0.5, // Explicit padding control for a sharp circular layout
                              "&:hover": {
                                backgroundColor: "#0284c7",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />{" "}
                            {/* ACTION: Scales down the vector icon dimension */}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Print Consultaion">
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
                            onClick={() => {
                              if (window.confirm("Delete this appointment?")) {
                                deleteAppointment(app.id).then(
                                  loadAppointments,
                                );
                              }
                            }}
                            sx={{
                              backgroundColor: "#fef2f2", // Light red background matching your dashboard style
                              p: 0.5,
                              "&:hover": {
                                backgroundColor: "#fee2e2",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />{" "}
                            {/* Scales the delete icon vector cleanly */}
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
