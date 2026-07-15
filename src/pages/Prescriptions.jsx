import React, { useEffect, useState } from "react";

import {
  Typography,
  Avatar,
  Card,
  CardContent,
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
  Stack,
} from "@mui/material";
import api from "../services/api";
// Icons
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";

import { getPatients } from "../api/patientApi";
import { getDoctors } from "../api/doctorApi";
import { getMedicines } from "../api/medicineApi";
import { getMedicineLabel } from "../utils/medicineFormatter";

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

const palette = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#dbe4ee",
  page: "#f3f7fb",
  panel: "#ffffff",
  blue: "#1d4ed8",
  cyan: "#0891b2",
  green: "#047857",
  amber: "#b45309",
  red: "#b91c1c",
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
        medicineLabel: getMedicineLabel(editSelectedMedicine),
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

    setPrescriptionItems([
      ...prescriptionItems,
      {
        ...medicineForm,
        medicineLabel: getMedicineLabel({
          dosageType: selectedMedicine?.dosageType,
          medicineName: medicineForm.medicineName,
        }),
      },
    ]);

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

  const selectedPatient = patients.find(
    (p) => String(p.id) === String(patientId),
  );
  const selectedVisit = patientVisits.find(
    (v) => String(v.id) === String(visitId),
  );
  const canSavePrescription = Boolean(
    patientId && visitId && prescriptionItems.length,
  );
  const totalMedicineDays = prescriptionItems.reduce(
    (sum, item) => sum + Number(item.days || 0),
    0,
  );
  const selectedMedicineStock =
    selectedMedicine?.stockQuantity ?? selectedMedicine?.stock ?? 0;

  const quickPresets = [
    {
      label: "Fever",
      dosage: "1-0-1",
      days: 3,
      instructions: "After Food",
      bg: "#fee2e2",
      color: "#b91c1c",
    },
    {
      label: "Pain",
      dosage: "1-0-1",
      days: 5,
      instructions: "After Food",
      bg: "#e0f2fe",
      color: "#0369a1",
    },
    {
      label: "Antibiotic",
      dosage: "1-1-1",
      days: 5,
      instructions: "After Food",
      bg: "#ecfccb",
      color: "#4d7c0f",
    },
    {
      label: "Night",
      dosage: "0-0-1",
      days: 7,
      instructions: "At Bed Time",
      bg: "#ede9fe",
      color: "#6d28d9",
    },
  ];

  const applyQuickPreset = (preset) => {
    setMedicineForm({
      ...medicineForm,
      dosage: preset.dosage,
      days: preset.days,
      instructions: preset.instructions,
    });
  };

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
              item.medicineLabel || item.medicineName,
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
    <Box
      sx={{
        p: { xs: 1.5, md: 3 },
        backgroundColor: palette.page,
        minHeight: "100vh",
      }}
    >
      <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: "#dbeafe",
                color: palette.blue,
                width: 54,
                height: 54,
              }}
            >
              <HistoryEduIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{ color: palette.ink, fontWeight: 950, letterSpacing: 0 }}
              >
                Prescription Desk
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: palette.muted, fontWeight: 750 }}
              >
                Fast medicine entry with patient visit context, presets, notes,
                print and history in one workflow.
              </Typography>
            </Box>
          </Stack>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              minHeight: 42,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 900,
                minHeight: 42,
              },
            }}
          >
            <Tab label="Add Prescription" />
            <Tab label="Prescription History" />
          </Tabs>
        </Stack>
      </Paper>

      {tabValue === 0 && (
        <Stack spacing={2.25}>
          <Grid container spacing={2} alignItems="stretch">
            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ ...panelSx, height: "100%" }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Avatar sx={{ bgcolor: "#e0f2fe", color: palette.cyan }}>
                      <PersonSearchIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 950, color: palette.ink }}
                      >
                        Patient
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.muted, fontWeight: 800 }}
                      >
                        Search PRN or name
                      </Typography>
                    </Box>
                  </Stack>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) =>
                      `${option.patientCode || ""} - ${option.name || ""}`
                    }
                    value={
                      patients.find(
                        (p) => String(p.id) === String(patientId),
                      ) || null
                    }
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
                      const res = await api.get(
                        `/api/visits/active/${value.id}`,
                      );
                      setPatientVisits(res.data || []);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    renderInput={(params) => (
                      <TextField {...params} label="Patient" fullWidth />
                    )}
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1.5 }}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      size="small"
                      label={selectedPatient?.patientCode || "No PRN"}
                      sx={{ fontWeight: 850 }}
                    />
                    <Chip
                      size="small"
                      label={selectedPatient?.phone || "No phone"}
                      variant="outlined"
                      sx={{ fontWeight: 850 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ ...panelSx, height: "100%" }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Avatar sx={{ bgcolor: "#ecfdf5", color: palette.green }}>
                      <MedicalServicesIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 950, color: palette.ink }}
                      >
                        Active Visit
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.muted, fontWeight: 800 }}
                      >
                        Select consultation
                      </Typography>
                    </Box>
                  </Stack>
                  <Autocomplete
                    options={patientVisits}
                    getOptionLabel={(option) => option.visitNumber || ""}
                    value={
                      patientVisits.find(
                        (v) => String(v.id) === String(visitId),
                      ) || null
                    }
                    onChange={(e, visit) => {
                      if (!visit) {
                        setVisitId("");
                        setDoctorName("");
                        return;
                      }
                      setVisitId(visit.id);
                      setDoctorName(visit.doctorName || "");
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    renderInput={(params) => (
                      <TextField {...params} label="Visit" fullWidth />
                    )}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: palette.muted, fontWeight: 800, mt: 1.5 }}
                  >
                    {selectedVisit
                      ? `Visit: ${selectedVisit.visitNumber || "-"}`
                      : "Choose patient to load active visits"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card elevation={0} sx={{ ...panelSx, height: "100%" }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Avatar sx={{ bgcolor: "#fef3c7", color: palette.amber }}>
                      <PlaylistAddCheckIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 950, color: palette.ink }}
                      >
                        Ready Check
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.muted, fontWeight: 800 }}
                      >
                        Doctor and medicines
                      </Typography>
                    </Box>
                  </Stack>
                  <TextField
                    fullWidth
                    label="Doctor"
                    value={doctorName}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    InputProps={{ readOnly: true }}
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1.5 }}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      color={patientId ? "success" : "default"}
                      size="small"
                      label={patientId ? "Patient selected" : "Patient pending"}
                      sx={{ fontWeight: 850 }}
                    />
                    <Chip
                      color={visitId ? "success" : "default"}
                      size="small"
                      label={visitId ? "Visit selected" : "Visit pending"}
                      sx={{ fontWeight: 850 }}
                    />
                    <Chip
                      color={prescriptionItems.length ? "success" : "default"}
                      size="small"
                      label={`${prescriptionItems.length} medicines`}
                      sx={{ fontWeight: 850 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2, md: 2.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{ mb: 2 }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: palette.ink, fontWeight: 950 }}
                >
                  Add Medicine
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: palette.muted, fontWeight: 750 }}
                >
                  Use presets to fill dosage, days and instructions quickly.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quickPresets.map((preset) => (
                  <Chip
                    key={preset.label}
                    icon={<TipsAndUpdatesIcon sx={{ fontSize: 16 }} />}
                    label={preset.label}
                    onClick={() => applyQuickPreset(preset)}
                    sx={{
                      fontWeight: 850,
                      bgcolor: preset.bg,
                      color: preset.color,
                      border: `1px solid ${preset.color}22`,
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, lg: 4 }}>
                <Autocomplete
                  value={selectedMedicine}
                  options={medicines}
                  getOptionLabel={(option) => getMedicineLabel(option) || ""}
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
                      {getMedicineLabel(option)}{" "}
                      <strong>(Stock: {option.stockQuantity || 0})</strong>
                    </li>
                  )}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Medicine"
                      helperText={
                        selectedMedicine
                          ? `Available stock: ${selectedMedicineStock}`
                          : "Select medicine from stock"
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Dosage</InputLabel>
                  <Select
                    value={medicineForm.dosage}
                    label="Dosage"
                    sx={{ borderRadius: 2 }}
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

              <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Days"
                  value={medicineForm.days}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  onChange={(e) =>
                    setMedicineForm({ ...medicineForm, days: e.target.value })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8, lg: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Instructions</InputLabel>
                  <Select
                    value={medicineForm.instructions}
                    label="Instructions"
                    sx={{ borderRadius: 2 }}
                    onChange={(e) =>
                      setMedicineForm({
                        ...medicineForm,
                        instructions: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="Before Food">Before Food</MenuItem>
                    <MenuItem value="After Food">After Food</MenuItem>
                    <MenuItem value="Before Breakfast">
                      Before Breakfast
                    </MenuItem>
                    <MenuItem value="After Breakfast">After Breakfast</MenuItem>
                    <MenuItem value="At Bed Time">At Bed Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4, lg: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  onClick={addMedicine}
                  sx={{
                    minHeight: 54,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 900,
                    bgcolor: palette.blue,
                  }}
                >
                  Add
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper elevation={0} sx={{ ...panelSx, overflow: "hidden" }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${palette.line}` }}>
                  <Typography
                    variant="h6"
                    sx={{ color: palette.ink, fontWeight: 950 }}
                  >
                    Prescription Medicines
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: palette.muted, fontWeight: 750 }}
                  >
                    {prescriptionItems.length
                      ? `${prescriptionItems.length} medicines added`
                      : "No medicines added yet"}
                  </Typography>
                </Box>
                <TableContainer sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={tableHeadSx}>
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
                        <TableRow key={`${item.medicineId}-${index}`} hover>
                          <TableCell sx={{ fontWeight: 850 }}>
                            {item.medicineLabel || item.medicineName}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={item.dosage || "-"}
                              sx={{ fontWeight: 850 }}
                            />
                          </TableCell>
                          <TableCell>{item.days || "-"}</TableCell>
                          <TableCell>{item.instructions || "-"}</TableCell>
                          <TableCell align="center">
                            <Tooltip title="Remove medicine">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setPrescriptionItems(
                                    prescriptionItems.filter(
                                      (_, i) => i !== index,
                                    ),
                                  )
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!prescriptionItems.length && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="center"
                            sx={{
                              py: 4,
                              color: palette.muted,
                              fontWeight: 800,
                            }}
                          >
                            Select a medicine and click Add to build the
                            prescription.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  ...panelSx,
                  p: 0,
                  height: "100%",
                  border: `1px solid ${palette.blue}`,
                  bgcolor: "rgba(37, 99, 235, 0.06)",
                  boxShadow: "0 24px 48px rgba(37, 99, 235, 0.08)",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    background: "linear-gradient(135deg, #0f172a, #2563eb)",
                    borderRadius: "16px 16px 0 0",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                    >
                      <LocalPharmacyIcon />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: "#fff", fontWeight: 950 }}
                      >
                        Prescription Summary
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          fontWeight: 750,
                        }}
                      >
                        Review before saving
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    {[
                      {
                        label: "Patient",
                        value: patientName || "Not selected",
                      },
                      {
                        label: "Visit",
                        value: selectedVisit?.visitNumber || "Not selected",
                      },
                      { label: "Medicines", value: prescriptionItems.length },
                      { label: "Total Days", value: totalMedicineDays },
                    ].map((row) => (
                      <Stack
                        key={row.label}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                          border: `1px solid ${palette.line}`,
                        }}
                      >
                        <Typography
                          sx={{ color: palette.muted, fontWeight: 800 }}
                        >
                          {row.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 950,
                            color: palette.ink,
                            textAlign: "right",
                            minWidth: 96,
                          }}
                        >
                          {row.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Doctor Notes"
                    value={notes}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": { borderRadius: 2 },
                    }}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={!canSavePrescription}
                    sx={{
                      minHeight: 46,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 950,
                      bgcolor: palette.green,
                    }}
                  >
                    Save Prescription
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      )}

      {tabValue === 1 && (
        <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ color: palette.ink, fontWeight: 950 }}
              >
                Prescription History
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: palette.muted, fontWeight: 750 }}
              >
                Search previous prescriptions and print copies.
              </Typography>
            </Box>
            <TextField
              placeholder="Search Patient Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: { xs: "100%", md: 360 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${palette.line}`,
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead sx={tableHeadSx}>
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
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontWeight: 850 }}>RX-{p.id}</TableCell>
                      <TableCell sx={{ fontWeight: 850 }}>
                        {p.patientName}
                      </TableCell>
                      <TableCell>{p.doctorName}</TableCell>
                      <TableCell>
                        {formatDateTime(p.prescriptionDate)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={p.items?.length || 0}
                          sx={{ fontWeight: 850 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton
                            color="info"
                            onClick={() => handleView(p)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton
                            color="primary"
                            onClick={() => generatePrescriptionPDF(p)}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            color="warning"
                            onClick={() => handleEdit(p)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(p.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {!filteredPrescriptions.length && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{ py: 4, color: palette.muted, fontWeight: 800 }}
                    >
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                )}
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
          sx: { borderRadius: "20px", p: 1 },
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

          <TableContainer
            component={Paper}
            sx={{ mt: 2, borderRadius: "12px", border: "1px solid #e0e6ed" }}
          >
            <Table size="small">
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background:
                      "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
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
                    <TableCell>
                      {item.medicineLabel || item.medicineName}
                    </TableCell>

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
          sx: { borderRadius: "20px", p: 1 },
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
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Patient"
                value={editPrescription?.patientName || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Visit"
                value={editPrescription?.visitNumber || ""}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
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

          <Paper
            sx={{
              p: 2,
              mt: 3,
              mb: 2,
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Add Medicine
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <FormControl sx={{ flex: 1, minWidth: "280px" }}>
                  <Autocomplete
                    options={medicines}
                    getOptionLabel={(option) => getMedicineLabel(option) || ""}
                    value={editSelectedMedicine}
                    onChange={(e, value) => setEditSelectedMedicine(value)}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>{getMedicineLabel(option)}</li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="Medicine" />
                    )}
                  />
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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

          <TableContainer
            component={Paper}
            sx={{ mt: 3, borderRadius: "12px", border: "1px solid #e0e6ed" }}
          >
            <Table>
              <TableHead
                sx={{
                  "& .MuiTableCell-head": {
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background:
                      "linear-gradient(90deg, #1E40AF, #3B82F6) !important",
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
                    <TableCell>
                      {item.medicineLabel || item.medicineName}
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        value={item.dosage}
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
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
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
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
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                        }}
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
