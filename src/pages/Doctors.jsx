import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Alert,
  Divider,
} from "@mui/material";

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../api/doctorApi";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      console.error("Load error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Auto-Uppercase Name and Specialization
    const upperValue =
      name === "name" || name === "specialization"
        ? value.toUpperCase()
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: upperValue,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.specialization) {
      setError("Doctor Name and Specialization are mandatory.");
      return;
    }

    try {
      if (editingId) {
        await updateDoctor(editingId, formData);
        alert("Doctor profile updated successfully!");
      } else {
        await createDoctor(formData);
        alert("Doctor added to hospital registry!");
      }
      resetForm();
      loadDoctors();
    } catch (err) {
      console.error("Backend Save Error:", err.response?.data);
      setError("Failed to save. Ensure your Spring Boot backend is connected.");
    }
  };

  const handleEdit = (doc) => {
    setEditingId(doc.id);
    setFormData({
      name: doc.name || "",
      specialization: doc.specialization || "",
      phone: doc.phone || "",
      email: doc.email || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", specialization: "", phone: "", email: "" });
    setError("");
  };

  return (
    <Box
      sx={{ padding: "6px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
    >
      {/* Header Section matching the new style */}
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#1e3a8a", mb: 1 }}>
          Staff Management
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", fontSize: "1.1rem" }}>
          Register and manage medical specialists and hospital staff for Madhav Ortho-Care
        </Typography>
      </Box> */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Form Section */}
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
          <TextField
            label="Staff Name"
            name="name"
            value={formData.name} 
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: "250px" }}
          />

          <TextField
            label="Specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: "250px" }}
          />

          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              ml: "auto",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={editingId ? <EditIcon /> : <PersonAddIcon />}
              sx={{
                minWidth: 180,
                height: 50,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,

                background: editingId
                  ? "linear-gradient(135deg, #06B6D4, #0891B2)"
                  : "linear-gradient(135deg, #10B981, #059669)",

                boxShadow: editingId
                  ? "0 8px 24px rgba(6,182,212,0.25)"
                  : "0 8px 24px rgba(16,185,129,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: editingId
                    ? "linear-gradient(135deg, #1E40AF, #06B6D4)"
                    : "linear-gradient(135deg, #1E40AF, #06B6D4)",

                  transform: "translateY(-2px)",

                  boxShadow: "0 12px 28px rgba(30,64,175,0.30)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {editingId ? "Update Profile" : "Add Specialist"}
            </Button>

            {editingId && (
              <Button
                variant="outlined"
                onClick={resetForm}
                startIcon={<DeleteIcon />}
                sx={{
                  height: 50,
                  px: 3,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,

                  color: "#EF4444",
                  borderColor: "#EF4444",

                  transition: "all 0.3s ease",

                  "&:hover": {
                    borderColor: "#DC2626",
                    backgroundColor: "#FEF2F2",

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

      {/* Table Section Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <SupervisorAccountIcon sx={{ color: "#1e3a8a" }} />
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
          Staff Directory
        </Typography>
      </Box>

      {/* Table Section */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", border: "1px solid #e0e6ed" }}
      >
        <Table size="small">
          <TableHead
            sx={{ background: "linear-gradient(90deg,#1E40AF,#3B82F6)" }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                NAME
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                SPECIALIZATION
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PHONE
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                EMAIL
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold" }}
                align="center"
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doc) => (
              <TableRow
                key={doc.id}
                hover
                sx={{ "&:nth-of-type(even)": { backgroundColor: "#f8faff" } }}
              >
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                  {`DOC-${String(doc.id).padStart(3, "0")}`}
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>{doc.name}</TableCell>
                <TableCell>{doc.specialization}</TableCell>
                <TableCell>{doc.phone}</TableCell>
                <TableCell>{doc.email}</TableCell>
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
                        onClick={() => handleEdit(doc)}
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

                    <Tooltip title="Delete Doctor">
                      <IconButton
                        size="small" // ACTION: Matched identical compact container dimensions
                        onClick={() => {
                          if (
                            window.confirm("Remove this doctor from registry?")
                          ) {
                            deleteDoctor(doc.id).then(loadDoctors);
                          }
                        }}
                        sx={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          p: 0.5,
                          "&:hover": {
                            backgroundColor: "#dc2626",
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
            ))}
            {doctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No doctors found in directory.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
