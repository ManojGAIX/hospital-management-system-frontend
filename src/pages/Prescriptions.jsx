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
  TablePagination,
  IconButton,
  Tooltip,
  Autocomplete,
  Divider,
  Grid,
  InputAdornment,
} from "@mui/material";
import api from "../services/api";
// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";

import { getPatients } from "../api/patientApi";
import { getDoctors } from "../api/doctorApi";
import { getMedicines } from "../api/medicineApi";

import { formatDateTime } from "../utils/dateFormatter";

import PrintIcon from "@mui/icons-material/Print";

import VisibilityIcon from "@mui/icons-material/Visibility";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import {
  getPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "../api/prescriptionApi";

export default function Prescriptions() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [visitId, setVisitId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [notes, setNotes] = useState("");
  const [patientName, setPatientName] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [patientVisits, setPatientVisits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [dosage, setDosage] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [prescriptionItems, setPrescriptionItems] = useState([]);

  const [viewOpen, setViewOpen] = useState(false);

  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [editOpen, setEditOpen] = useState(false);

  const [editingPrescription, setEditingPrescription] = useState(null);

  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [editPrescription, setEditPrescription] = useState(null);

  const [editItems, setEditItems] = useState([]);

  const [editSelectedMedicine, setEditSelectedMedicine] = useState(null);

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

  const handleEdit = (prescription) => {
    setEditPrescription(prescription);

    setEditItems(prescription.items ? [...prescription.items] : []);

    setEditOpen(true);
  };

  const handleEditMedicineChange = (index, field, value) => {
    const updated = [...editItems];

    updated[index][field] = value;

    setEditItems(updated);
  };

  const removeEditMedicine = (index) => {
    const updated = [...editItems];

    updated.splice(index, 1);

    setEditItems(updated);
  };

  const addMedicineToEdit = () => {
    if (!editSelectedMedicine) {
      showNotification("Please select a medicine", "warning");
      return;
    }

    const exists = editItems.some(
      (item) => item.medicineId === editSelectedMedicine.id,
    );

    if (exists) {
      showNotification("Medicine already added", "warning");
      return;
    }

    setEditItems([
      ...editItems,
      {
        medicineId: editSelectedMedicine.id,
        medicineName: editSelectedMedicine.medicineName,
        dosage: "",
        days: 1,
        instructions: "",
        quantity: 1,
        price: editSelectedMedicine.price || 0,
      },
    ]);

    setEditSelectedMedicine(null);

    showNotification("Medicine added successfully", "success");
  };

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setViewOpen(true);
  };

  // Dosage Options
  const dosageOptions = [
    { label: "1-0-1 (Morning & Night)", value: "1-0-1" },
    { label: "1-1-1 (Morning, Noon & Night)", value: "1-1-1" },
    { label: "1-0-0 (Morning Only)", value: "1-0-0" },
    { label: "0-0-1 (Night Only)", value: "0-0-1" },
    { label: "1-1-0 (Morning & Noon)", value: "1-1-0" },
    { label: "SOS (As Needed)", value: "SOS" },
  ];

  const [medicineForm, setMedicineForm] = useState({
    medicineId: "",
    medicineName: "",
    dosage: "",
    days: "",
    instructions: "",
    quantity: 1,
    price: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const patientRes = await getPatients();
      const doctorRes = await getDoctors();
      const medicineRes = await getMedicines();
      const prescriptionRes = await getPrescriptions();

      setPatients(patientRes.data.data || []);
      setDoctors(doctorRes.data || doctorRes);
      setMedicines(medicineRes.data || medicineRes);
      setPrescriptions(prescriptionRes.data || prescriptionRes);
    } catch (err) {
      console.error(err);
    }
  };

  const payload = {
    patientId,

    visitId,

    patientName,

    doctorName,

    notes,

    items: prescriptionItems,
  };

  const addMedicine = () => {
    if (!medicineForm.medicineId) {
      showNotification("Please select a medicine", "warning");
      return;
    }

    // Check duplicate medicine
    const exists = prescriptionItems.some(
      (item) => item.medicineId === medicineForm.medicineId,
    );

    if (exists) {
      showNotification("Medicine already added to prescription", "warning");
      return;
    }

    setPrescriptionItems([...prescriptionItems, medicineForm]);

    // Reset form
    setSelectedMedicine(null);

    setMedicineForm({
      medicineId: "",
      medicineName: "",
      dosage: "",
      days: "",
      instructions: "",
      quantity: 1,
      price: 0,
    });

    showNotification("Medicine added successfully", "success");
  };

  const handleSave = async () => {
    try {
      if (!patientId) {
        alert("Select Patient");
        return;
      }

      if (!visitId) {
        alert("Select Visit");
        return;
      }

      if (prescriptionItems.length === 0) {
        alert("Add at least one medicine");
        return;
      }

      const payload = {
        patientId,
        patientName,
        visitId,
        doctorName,
        notes,
        items: prescriptionItems,
      };

      await createPrescription(payload);

      showNotification("Prescription saved successfully", "success");

      setPrescriptionItems([]);
      setNotes("");

      loadData();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save prescription", "error");
    }
  };

  const filteredPrescriptions = prescriptions
    .filter((p) =>
      (p.patientName || "").toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.id - a.id);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prescription?")) {
      return;
    }

    try {
      await deletePrescription(id);

      showNotification("Prescription deleted successfully", "success");

      loadData();
    } catch (err) {
      console.error(err);

      alert("Failed to delete prescription");
    }
  };

  const handleUpdatePrescription = async () => {
    try {
      const payload = {
        ...editPrescription,

        items: editItems,
      };

      await updatePrescription(editPrescription.id, payload);

      showNotification("Prescription updated successfully", "success");

      setEditOpen(false);

      loadData();
    } catch (err) {
      console.error(err);

      showNotification("Failed to update prescription", "error");
    }
  };

  const generatePrescriptionPDF = async (prescription) => {
    try {
      const doc = new jsPDF();

      const img = new Image();
      img.src = "/logo.png";

      img.onload = () => {
        // ============================================
        // HOSPITAL HEADER
        // ============================================

        const logoWidth = 160;
        const logoHeight = 36;

        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        // Hospital Logo
        doc.addImage(
          img,
          "PNG",
          (pageWidth - logoWidth) / 2,
          6,
          logoWidth,
          logoHeight,
        );

        // Address
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.setFont(undefined, "normal");

        doc.text(
          "Madhav Hospital Premises, Near Kanni Towers, Railway Station Road, Indi - 586209",
          centerX,
          46,
          {
            align: "center",
          },
        );

        doc.text(
          "Ph: +91 73538 20079 | Email: info@madhavhospital.com",
          centerX,
          55,
          { align: "center" },
        );

        // Divider Line
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(10, 62, 200, 62);

        // ============================================
        // TITLE
        // ============================================

        doc.setFontSize(18);
        doc.setTextColor(30, 58, 138);
        doc.setFont(undefined, "bold");

        doc.text("PRESCRIPTION", 105, 74, {
          align: "center",
        });

        doc.setFontSize(10);

        doc.text(`Prescription No : RX-${prescription.id}`, 15, 80);

        // ============================================
        // PATIENT DETAILS
        // ============================================

        let y = 92;

        doc.setFontSize(12);
        doc.setTextColor(0);

        // --------------------------------------------
        // Row 1
        // --------------------------------------------

        doc.setFont(undefined, "bold");
        doc.text("Patient Name", 15, y);
        doc.text(":", 55, y);

        doc.setFont(undefined, "normal");
        doc.text(prescription.patientName || "-", 60, y);

        doc.setFont(undefined, "bold");
        doc.text("Doctor", 125, y);
        doc.text(":", 155, y);

        doc.setFont(undefined, "normal");
        doc.text(prescription.doctorName || "-", 160, y);

        // --------------------------------------------
        // Row 2
        // --------------------------------------------

        y += 12;

        doc.setFont(undefined, "bold");
        doc.text("PRN", 15, y);
        doc.text(":", 55, y);

        doc.setFont(undefined, "normal");

        doc.text(
          `PRN${String(prescription.patientId || 0).padStart(4, "0")}`,
          60,
          y,
        );

        doc.setFont(undefined, "bold");
        doc.text("Date", 125, y);
        doc.text(":", 155, y);

        doc.setFont(undefined, "normal");

        doc.text(formatDateTime(prescription.prescriptionDate), 160, y);

        // --------------------------------------------
        // Row 3
        // --------------------------------------------

        y += 12;

        doc.setFont(undefined, "bold");
        doc.text("Visit Number", 15, y);
        doc.text(":", 55, y);

        doc.setFont(undefined, "normal");
        doc.text(prescription.visitNumber || "-", 60, y);

        doc.setFont(undefined, "bold");
        doc.text("Visit Type", 125, y);
        doc.text(":", 155, y);

        doc.setFont(undefined, "normal");
        doc.text(prescription.visitType || "OP", 160, y);

        // ============================================
        // DIVIDER
        // ============================================

        y += 10;

        doc.setDrawColor(180);
        doc.line(10, y, 200, y);

        // ============================================
        // MEDICINE TABLE
        // ============================================

        autoTable(doc, {
          startY: y + 8,

          head: [["#", "MEDICINE", "DOSAGE", "DURATION", "INSTRUCTIONS"]],

          body:
            prescription.items?.map((item, index) => [
              index + 1,
              item.medicineName,
              item.dosage,
              `${item.days} Day(s)`,
              item.instructions || "-",
            ]) || [],

          theme: "grid",

          headStyles: {
            fillColor: [30, 58, 138],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },

          styles: {
            fontSize: 10,
            cellPadding: 4,
          },

          bodyStyles: {
            textColor: 40,
          },

          columnStyles: {
            0: {
              halign: "center",
              cellWidth: 12,
            },

            1: {
              cellWidth: 50,
            },

            2: {
              halign: "center",
              cellWidth: 45,
            },

            3: {
              halign: "center",
              cellWidth: 30,
            },

            4: {
              cellWidth: 50,
            },
          },
        });

        // ============================================
        // NOTES SECTION
        // ============================================

        const finalY = doc.lastAutoTable.finalY + 15;

        doc.setFont(undefined, "bold");
        doc.setFontSize(12);

        doc.text("Doctor Notes:", 15, finalY);

        doc.setFont(undefined, "normal");
        doc.setFontSize(10);

        const notes =
          prescription.notes || "Take medicines as advised by your doctor.";

        const splitNotes = doc.splitTextToSize(notes, 170);

        doc.text(splitNotes, 15, finalY + 8);

        // ============================================
        // GENERAL INSTRUCTIONS
        // ============================================

        const instructionY = finalY + 25;

        doc.setFont(undefined, "bold");

        doc.text("General Instructions:", 15, instructionY);

        doc.setFont(undefined, "normal");

        doc.text("Take medicines on time.", 15, instructionY + 8);

        doc.text(
          "Complete the full course of medication.",
          15,
          instructionY + 16,
        );

        doc.text(
          "Contact your doctor if symptoms persist.",
          15,
          instructionY + 24,
        );

        // ============================================
        // SIGNATURE SECTION
        // ============================================

        const signatureY = instructionY + 50;

        doc.line(130, signatureY, 190, signatureY);

        doc.setFont(undefined, "bold");
        doc.setFontSize(11);

        doc.text(prescription.doctorName || "Doctor", 145, signatureY + 8);

        doc.setFont(undefined, "normal");

        doc.text("Consultant Doctor", 145, signatureY + 16);

        // ============================================
        // FOOTER
        // ============================================

        const pageHeight = doc.internal.pageSize.height;

        doc.setFontSize(8);

        doc.setTextColor(120);

        doc.text(
          "Generated from Hospital Management System",
          105,
          pageHeight - 10,
          {
            align: "center",
          },
        );

        // ============================================
        // SAVE
        // ============================================

        doc.save(`Prescription_${prescription.visitNumber}.pdf`);
      };
    } catch (error) {
      console.error(error);

      alert("Failed to generate prescription PDF");
    }
  };

  return (
    <Box p={1}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Add Prescription" />
          <Tab label="Prescription History" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                sx={{
                  flex: 1,
                  minWidth: 250,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                }}
                options={patients}
                getOptionLabel={(option) =>
                  `${option.patientCode || ""} - ${option.name || ""}`
                }
                value={patients.find((p) => p.id === patientId) || null}
                onChange={async (event, value) => {
                  if (!value) {
                    setPatientId("");
                    setPatientName("");
                    setPatientVisits([]);
                    setVisitId("");
                    setDoctorName("");
                    return;
                  }

                  setPatientId(value.id);
                  setPatientName(value.name);

                  const res = await api.get(`/api/visits/active/${value.id}`);

                  setPatientVisits(res.data || []);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Patient" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                sx={{
                  flex: 1,
                  minWidth: 150,
                  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                }}
                options={patientVisits}
                getOptionLabel={(option) => option.visitNumber || ""}
                value={patientVisits.find((v) => v.id === visitId) || null}
                onChange={(e, visit) => {
                  if (!visit) {
                    setVisitId("");
                    setDoctorName("");
                    return;
                  }
                  console.log(visit);

                  setVisitId(visit.id);

                  setDoctorName(visit.doctorName || "");
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Visit" />
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Doctor"
                value={doctorName}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Add Medicine
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl sx={{ flex: 1, minWidth: "280px" }}>
                <Autocomplete
                  value={selectedMedicine}
                  options={medicines}
                  getOptionLabel={(option) => option.medicineName || ""}
                  onChange={(e, value) => {
                    setSelectedMedicine(value);

                    if (!value) {
                      setMedicineForm({
                        ...medicineForm,
                        medicineId: "",
                        medicineName: "",
                        price: 0,
                      });
                      return;
                    }

                    setMedicineForm({
                      ...medicineForm,
                      medicineId: value.id,
                      medicineName: value.medicineName,
                      price: value.price,
                    });
                  }}
                  renderOption={(props, option) => (
                    <li {...props}>
                      {option.medicineName}{" "}
                      <strong>(Stock: {option.stockQuantity || 0})</strong>
                    </li>
                  )}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  renderInput={(params) => (
                    <TextField {...params} label="Medicine" />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              {/* DOSAGE */}

              <FormControl sx={{ flex: 1, minWidth: "200px" }}>
                <InputLabel>Dosage Pattern</InputLabel>

                <Select
                  value={medicineForm.dosage}
                  label="Dosage Pattern"
                  placeholder="1-0-1"
                  sx={{ borderRadius: "12px" }}
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      dosage: e.target.value,
                    })
                  }
                >
                  {dosageOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Days"
                value={medicineForm.days}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                onChange={(e) =>
                  setMedicineForm({
                    ...medicineForm,
                    days: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl sx={{ flex: 1, minWidth: "200px" }}>
                <InputLabel>Instructions</InputLabel>

                <Select
                  value={medicineForm.instructions}
                  label="Instructions"
                  sx={{ borderRadius: "12px" }}
                  onChange={(e) =>
                    setMedicineForm({
                      ...medicineForm,
                      instructions: e.target.value,
                    })
                  }
                >
                  <MenuItem value="Before Food">Before Food</MenuItem>

                  <MenuItem value="After Food">After Food</MenuItem>

                  <MenuItem value="Before Breakfast">Before Breakfast</MenuItem>

                  <MenuItem value="After Breakfast">After Breakfast</MenuItem>

                  <MenuItem value="At Bed Time">At Bed Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={addMedicine}
                sx={{
                  height: 52,
                  minWidth: 190,
                  px: 4,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.3px",

                  background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                  color: "#fff",

                  boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

                  transition: "all 0.3s ease",

                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(30,64,175,0.35)",

                    background: "linear-gradient(135deg, #1D4ED8, #0891B2)",
                  },

                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                Add Medicine
              </Button>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ mt: 3, borderRadius: "12px", border: "1px solid #e0e6ed" }}>
            <Table>
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Instructions</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {prescriptionItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.medicineName}</TableCell>

                    <TableCell>{item.dosage}</TableCell>

                    <TableCell>{item.days}</TableCell>

                    <TableCell>{item.instructions}</TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() =>
                          setPrescriptionItems(
                            prescriptionItems.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={notes}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                height: 42,
                minWidth: 110,
                px: 4,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: "linear-gradient(135deg, #10B981, #059669)",

                color: "#fff",

                boxShadow: "0 8px 24px rgba(16,185,129,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(16,185,129,0.35)",

                  background: "linear-gradient(135deg, #059669, #047857)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Save Prescription
            </Button>
          </Box>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search Patient Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer
            component={Paper}
            sx={{ borderRadius: "12px", border: "1px solid #e0e6ed" }}
          >
            <Table size="small">
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
                  },
                }}
              >
                <TableRow>
                  <TableCell>ID</TableCell>

                  <TableCell>Patient</TableCell>

                  <TableCell>Doctor</TableCell>

                  <TableCell>Date</TableCell>

                  <TableCell>Medicines</TableCell>

                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredPrescriptions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>

                      <TableCell>{p.patientName}</TableCell>

                      <TableCell>{p.doctorName}</TableCell>

                      <TableCell>{p.prescriptionDate}</TableCell>

                      <TableCell>{p.items?.length || 0}</TableCell>

                      <TableCell align="center">
                        <IconButton color="info" onClick={() => handleView(p)}>
                          <VisibilityIcon />
                        </IconButton>

                        <IconButton
                          color="primary"
                          onClick={() => generatePrescriptionPDF(p)}
                        >
                          <PrintIcon />
                        </IconButton>

                        <IconButton
                          color="warning"
                          onClick={() => handleEdit(p)}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() => handleDelete(p.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredPrescriptions.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        </Paper>
      )}

      <Dialog
         open={viewOpen}
         onClose={() => setViewOpen(false)}
         maxWidth="md"
         fullWidth
         PaperProps={{
           sx: { borderRadius: "20px", p: 1 }
         }}
       >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Prescription Details
          <IconButton
            onClick={() => {
              setViewOpen(false);
              setSelectedPrescription(null);
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography>Patient: {selectedPrescription?.patientName}</Typography>

          <Typography>Doctor: {selectedPrescription?.doctorName}</Typography>

          <Typography>
            Date: {selectedPrescription?.prescriptionDate}
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: "12px", border: "1px solid #e0e6ed" }}>
            <Table size="small">
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Medicine</TableCell>

                  <TableCell>Dosage</TableCell>

                  <TableCell>Days</TableCell>

                  <TableCell>Instructions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {selectedPrescription?.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.medicineName}</TableCell>

                    <TableCell>{item.dosage}</TableCell>

                    <TableCell>{item.days}</TableCell>

                    <TableCell>{item.instructions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog
         open={editOpen}
         onClose={() => setEditOpen(false)}
         maxWidth="lg"
         fullWidth
         PaperProps={{
           sx: { borderRadius: "20px", p: 1 }
         }}
       >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Edit Prescription
          <IconButton
            onClick={() => {
              setEditOpen(false);
              setEditPrescription(null);
              setEditItems([]);
              setEditSelectedMedicine(null);
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Patient"
                value={editPrescription?.patientName || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Visit"
                value={editPrescription?.visitNumber || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Doctor"
                value={editPrescription?.doctorName || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>

          {/* ADD MEDICINE SECTION */}

          <Paper sx={{ p: 2, mt: 3, mb: 2, borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Add Medicine
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <FormControl sx={{ flex: 1, minWidth: "280px" }}>
                  <Autocomplete
                    options={medicines}
                    getOptionLabel={(option) => option.medicineName || ""}
                    value={editSelectedMedicine}
                    onChange={(e, value) => setEditSelectedMedicine(value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                    renderInput={(params) => (
                      <TextField {...params} label="Medicine" />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={addMedicineToEdit}
                  sx={{ height: 56, borderRadius: "12px" }}
                >
                  Add Medicine
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper} sx={{ mt: 3, borderRadius: "12px", border: "1px solid #e0e6ed" }}>
            <Table>
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Medicine</TableCell>

                  <TableCell>Dosage</TableCell>

                  <TableCell>Days</TableCell>

                  <TableCell>Instructions</TableCell>

                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {editItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.medicineName}</TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={item.dosage}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                        onChange={(e) =>
                          handleEditMedicineChange(
                            index,
                            "dosage",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.days}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                        onChange={(e) =>
                          handleEditMedicineChange(
                            index,
                            "days",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={item.instructions}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                        onChange={(e) =>
                          handleEditMedicineChange(
                            index,
                            "instructions",
                            e.target.value,
                          )
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => removeEditMedicine(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            justifyContent: "space-between",
          }}
        >
          <Button
            color="error"
            variant="outlined"
            onClick={() => setEditOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdatePrescription}
          >
            Update Prescription
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
