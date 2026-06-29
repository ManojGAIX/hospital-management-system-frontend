import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import TodayIcon from "@mui/icons-material/Today";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { getPatients } from "../api/patientApi";
import { getAppointments } from "../api/appointmentApi";
import { Link } from "react-router-dom";
import { getLowStockMedicines } from "../api/medicineApi";
import { formatDateTime } from "../utils/dateFormatter";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    patients: 0,
    appointments: 0,
    todayAppointments: 0,
    billing: 0,
  });

  const [recentAppointments, setRecentAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    loadLowStock();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        getPatients(),
        getAppointments(),
      ]);

      const allAppointments = appointmentsRes.data || [];

      const localTodayStr = new Date().toISOString().split("T")[0];

      const todayCount = allAppointments.filter((app) => {
        if (!app.date) return false;
        return app.date.split("T")[0] === localTodayStr;
      }).length;

      setCounts({
        patients: patientsRes.data.length,
        appointments: allAppointments.length,
        todayAppointments: todayCount,
        billing: 0,
      });

      setPatientsList(patientsRes.data);

      const sorted = [...allAppointments].reverse().slice(0, 5);
      setRecentAppointments(sorted);
    } catch (err) {
      console.error("Dashboard load failed", err);
    }
  };

  const getPatientName = (id) => {
    const patient = patientsList.find((p) => p.id === id);
    return patient ? patient.name : "Unknown Patient";
  };

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

      default:
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          text: "#b45309",
          border: "rgba(245, 158, 11, 0.3)",
        };
    }
  };

  const cards = [
    {
      title: "Total Patients",
      value: counts.patients,
      icon: <PeopleIcon sx={{ fontSize: 35, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    },
    {
      title: "Today's Appts",
      value: counts.todayAppointments,
      icon: <TodayIcon sx={{ fontSize: 35, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #047857 0%, #10b981 100%)",
    },
    {
      title: "All Appts",
      value: counts.appointments,
      icon: <EventIcon sx={{ fontSize: 35, color: "#fff" }} />,
      bg: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)",
    },
  ];

  async function loadLowStock() {
    try {
      const res = await getLowStockMedicines();
      setLowStockMedicines(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Button
          startIcon={<AddCircleIcon />}
          component={Link}
          to="/appointments"
          variant="contained"
          sx={{
            borderRadius: 3,
            height: 50,
            px: 4,
            fontWeight: 700,
            fontSize: "14px",
            letterSpacing: "0.3px",

            background: "linear-gradient(135deg,#06B6D4,#1E40AF)",

            color: "#fff",

            boxShadow: "0 8px 20px rgba(6,182,212,0.25)",

            "&:hover": {
              background: "linear-gradient(135deg,#0891B2,#1D4ED8)",

              transform: "translateY(-2px)",

              boxShadow: "0 12px 28px rgba(6,182,212,0.35)",
            },
          }}
        >
          Book Appointment
        </Button>
      </Box>

      {/* DASHBOARD CARDS */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: 4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                background: card.bg,
                backdropFilter: "blur(10px)",
                color: "#fff",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.85,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mt: 0.5,
                    }}
                  >
                    {card.value}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    p: 1.5,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* RECENT APPOINTMENTS */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "#1e3a8a",
        }}
      >
        Recent Appointments
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #e0e6ed",
          mb: 4,
        }}
      >
        <Table size="small">
          <TableHead
            sx={{
              background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
            }}
          >
            <TableRow>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", textalign: "center" }}
              >
                SI No
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                PATIENT ID
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                PATIENT NAME
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                DOCTOR NAME
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                DATE & TIME
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {recentAppointments.map((app, index) => {
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
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {`PRN${String(app.patientId).padStart(4, "0")}`}
                  </TableCell>
                  <TableCell>{getPatientName(app.patientId)}</TableCell>
                  <TableCell>{app.doctorName || "N/A"}</TableCell>
                  <TableCell>{formatDateTime(app.date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status || "Booked"}
                      size="small"
                      sx={{
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`,
                        fontWeight: "bold",
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Box sx={{ p: 2, textAlign: "center", backgroundColor: "#fff" }}>
          <Button
            endIcon={<ArrowForwardIcon />}
            component={Link}
            to="/appointments"
            sx={{ fontWeight: "bold", color: "#1e3a8a" }}
          >
            View All Records
          </Button>
        </Box>
      </TableContainer>

      {/* LOW STOCK MEDICINES */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "#b91c1c",
        }}
      >
        Low Stock Medicines
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #e0e6ed",
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#b91c1c" }}>
            <TableRow>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", textalign: "center" }}
              >
                SI No
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                MEDICINE NAME
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                MANUFACTURER
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                BATCH NO
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                EXPIRY DATE
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                UNIT PRICE
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                AVAILABLE STOCK
              </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {lowStockMedicines.length > 0 ? (
              lowStockMedicines.map((med, index) => (
                <TableRow
                  key={med.id}
                  hover
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fff7f7",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {med.medicineName}
                  </TableCell>

                  <TableCell>{med.manufacturer || "N/A"}</TableCell>

                  <TableCell>{med.batchNo || "N/A"}</TableCell>

                  <TableCell>{med.expiryDate || "N/A"}</TableCell>

                  <TableCell>{med.price || "N/A"}</TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: med.stock <= 5 ? "#dc2626" : "#b45309",
                        textAlign: "center",
                      }}
                    >
                      {med.stockQuantity}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={med.stockQuantity <= 5 ? "Critical" : "Low Stock"}
                      size="small"
                      sx={{
                        backgroundColor:
                          med.stock <= 5
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(245,158,11,0.15)",

                        color: med.stock <= 5 ? "#b91c1c" : "#b45309",

                        fontWeight: "bold",
                        borderRadius: "6px",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No low stock medicines
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
