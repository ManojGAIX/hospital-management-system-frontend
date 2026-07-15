import React, { useState, useMemo, useEffect, useRef } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Stack,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  InputAdornment,
  Avatar,
  IconButton,
  Autocomplete,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import CakeIcon from "@mui/icons-material/Cake";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PhoneIcon from "@mui/icons-material/Phone";
import ScienceIcon from "@mui/icons-material/Science";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";
import { getMedicineLabel } from "../utils/medicineFormatter";

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
  violet: "#6d28d9",
};

const panelSx = {
  borderRadius: 2,
  border: `1px solid ${palette.line}`,
  backgroundColor: palette.panel,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
};

const formatAmount = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return "-";
  return String(value).split("T")[0];
};

const getXrayFilmUrl = (test) => test?.xrayUrl || test?.xRayUrl || test?.filmUrl || test?.imageUrl || test?.reportImageUrl || test?.scanImageUrl || test?.fileUrl || test?.reportUrl || "";

const isImageFilm = (url = "", contentType = "") => /^image\//i.test(contentType) || /\.(png|jpe?g|webp|gif|bmp)(\?.*)?$/i.test(url) || String(url).startsWith("data:image/");

const isXrayTest = (test) => {
  const text = `${test?.testName || ""} ${test?.reportType || ""} ${test?.category || ""} ${test?.modality || ""}`.toLowerCase();
  return text.includes("x-ray") || text.includes("xray") || text.includes("radiology") || text.includes("scan");
};

function DetailLine({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 750, minWidth: 118 }}>
        {label}
      </Typography>
      <Typography variant="body2" align="right" sx={{ color: palette.ink, fontWeight: strong ? 950 : 800, overflowWrap: "anywhere" }}>
        {value || "-"}
      </Typography>
    </Stack>
  );
}

function KpiCard({ title, value, detail, icon: Icon, color }) {
  return (
    <Card elevation={0} sx={{ ...panelSx, height: "100%" }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box>
            <Typography variant="caption" sx={{ color: palette.muted, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 950, mt: 0.5, letterSpacing: 0 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 750 }}>
              {detail}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: `${color}16`, color, width: 44, height: 44 }}>
            <Icon />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}

function InfoPanel({ title, icon: Icon, children, tone = palette.blue }) {
  return (
    <Paper elevation={0} sx={{ ...panelSx, p: 2, height: "100%" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: `${tone}16`, color: tone }}>
          <Icon fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ color: palette.ink, fontWeight: 950 }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </Paper>
  );
}

export default function PatientProfile() {
  const { patientId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!patientId);
  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [tab, setTab] = useState(0);
  const [scanReports, setScanReports] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  
  // Date range picker states for statements
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadPatientOptions = async () => {
      try {
        const response = await api.get("/api/patients");
        setPatientOptions(response.data?.data || response.data || []);
      } catch (error) {
        console.error("Failed to load patient options:", error);
      }
    };

    loadPatientOptions();
  }, []);
  useEffect(() => {
    if (patientId) {
      loadProfile(patientId);
    } else {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patient?.id) {
      const savedPhoto = localStorage.getItem(`patient_photo_${patient.id}`);
      setPhoto(savedPhoto || null);
    }
  }, [patient]);

  const loadScanReports = async (id) => {
    try {
      const response = await api.get("/api/scanreports");
      const reports = response.data?.data || response.data || [];
      const patientReports = reports.filter(
        (report) => String(report.patientId) === String(id),
      );
      const reportsWithFiles = await Promise.all(
        patientReports.map(async (report) => {
          const fileReference = report.fileName || report.filePath || report.fileUrl;
          if (!fileReference) return report;

          const fileName = String(fileReference).replace(/\\/g, "/").split("/").pop();
          try {
            const fileResponse = await api.get(
              `/api/scanreports/download/${encodeURIComponent(fileName)}`,
              { responseType: "blob" },
            );
            const contentType =
              fileResponse.headers["content-type"] || fileResponse.data.type || "";
            return {
              ...report,
              fileUrl: URL.createObjectURL(
                new Blob([fileResponse.data], { type: contentType }),
              ),
              fileContentType: contentType,
            };
          } catch (error) {
            console.error("Failed to load scan file:", error);
            return report;
          }
        }),
      );
      setScanReports(reportsWithFiles);
    } catch (error) {
      console.error("Failed to load scan reports:", error);
      setScanReports([]);
    }
  };

  useEffect(() => () => {
    scanReports.forEach((report) => {
      if (report.fileUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(report.fileUrl);
      }
    });
  }, [scanReports]);
  const loadProfile = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/patientprofile/${id}`);
      setPatient(res.data.patient);
      setData(res.data);
      loadScanReports(id);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile. Make sure the patient ID exists.");
    } finally {
      setLoading(false);
    }
  };


  const handleSearchPatient = () => {
    const query = search.trim().toLowerCase();
    if (!query) return;

    const selectedPatient = patientOptions.find((option) =>
      [option.id, option.patientCode, option.name, option.phone, option.mobile]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase() === query),
    );
    const numericId = search.replace(/\D/g, "");

    if (selectedPatient) {
      setSearch(`${selectedPatient.patientCode || `PRN${selectedPatient.id}`} - ${selectedPatient.name || "Patient"}`);
      loadProfile(selectedPatient.id);
    } else if (numericId) {
      loadProfile(numericId);
    } else {
      alert("Select a patient from the list or enter a valid patient ID.");
    }
  };
  const handlePhotoUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setPhoto(base64Data);
        if (patient?.id) {
          localStorage.setItem(`patient_photo_${patient.id}`, base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= DATA LOGS =================
  const visits = data?.visits || [];
  const invoices = data?.invoices || [];
  const pharmacy = data?.pharmacySales || [];
  const profileLabTests = data?.labTests || [];
  const labTests = [
    ...profileLabTests,
    ...scanReports.map((report) => ({
      ...report,
      testName: report.reportType || "Scan Report",
      testDate: report.uploadDate,
      category: "scan",
      reportUrl: report.fileUrl,
      scanImageUrl: report.fileUrl,
    })),
  ];
  const xrayTests = labTests.filter(isXrayTest);
  const featuredXray = xrayTests.find((test) => getXrayFilmUrl(test)) || xrayTests[0] || null;
  const featuredXrayUrl = getXrayFilmUrl(featuredXray);
  const procedures = data?.procedureBills || [];
  const physio = data?.physioSessions || [];
  const prescriptions = data?.prescriptions || [];

  const kpis = useMemo(
    () => ({
      visits: data?.visitCount || 0,
      invoices: data?.invoiceCount || 0,
      pharmacy: data?.pharmacyCount || 0,
      revenue: data?.totalRevenue || 0,
    }),
    [data],
  );

  const filteredVisits = visits.filter(
    (v) =>
      (v.visitNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.doctorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const latestVisit = visits[0] || null;
  const latestPrescription = prescriptions[0] || null;
  const latestLabTest = labTests[0] || null;
  const openLabTests = labTests.filter((test) => String(test.status || "").toLowerCase() !== "completed").length;
  const medicineCount = prescriptions.reduce((sum, item) => sum + (item.items?.length || 0), 0);
  const procedureTotal = procedures.reduce((sum, bill) => sum + Number(bill.finalAmount || 0), 0);
  const pharmacyTotal = pharmacy.reduce((sum, bill) => sum + Number(bill.finalAmount || 0), 0);
  const invoiceTotal = invoices.reduce((sum, bill) => sum + Number(bill.totalAmount || bill.finalAmount || 0), 0);
  const patientCode = patient?.patientCode || (patient?.id ? `PRN${String(patient.id).padStart(4, "0")}` : "-");
  const allergyText = patient?.allergies || "No known allergies recorded";
  const chronicText = patient?.chronicDiseases || "No chronic conditions recorded";

  const patientKpis = [
    { title: "OPD Visits", value: kpis.visits, detail: latestVisit ? `Last visit ${formatDate(latestVisit.visitDate)}` : "No visit history", icon: CalendarTodayIcon, color: palette.blue },
    { title: "Prescriptions", value: prescriptions.length, detail: `${medicineCount} medicines prescribed`, icon: LocalPharmacyIcon, color: palette.green },
    { title: "Lab Orders", value: labTests.length, detail: `${openLabTests} pending or in process`, icon: ScienceIcon, color: palette.cyan },
    { title: "Total Spend", value: formatAmount(kpis.revenue || invoiceTotal + pharmacyTotal + procedureTotal), detail: "Billing, pharmacy and procedures", icon: ReceiptIcon, color: palette.red },
  ];

  // ================= PDF SINGLE DOWNLOAD ACTIONS =================

  const handlePrintPrescription = (prescription) => {
    try {
      const doc = new jsPDF();
      const img = new Image();
      img.src = hospitalLogo;

      img.onload = () => {
        const logoWidth = 160;
        const logoHeight = 36;
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        // Logo
        doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 6, logoWidth, logoHeight);

        // Address
        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.setFont(undefined, "normal");
        doc.text("Madhav Hospital Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 46, { align: "center" });
        doc.text("Ph: +91 73538 20079 | Email: info@madhavhospital.com", centerX, 53, { align: "center" });

        // Divider Line
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.8);
        doc.line(10, 58, 200, 58);

        // Title
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.setFont(undefined, "bold");
        doc.text("PRESCRIPTION", centerX, 68, { align: "center" });

        // Details
        let y = 82;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.setFont(undefined, "bold");
        doc.text("Patient Name", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(patient?.name || "-", 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Doctor Name", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(prescription.doctorName || "-", 160, y);

        y += 8;
        doc.setFont(undefined, "bold");
        doc.text("PRN", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(patient?.patientCode || "-", 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Date", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(prescription.prescriptionDate || "-", 160, y);

        y += 8;
        doc.setFont(undefined, "bold");
        doc.text("Visit Number", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(prescription.visitNumber || "-", 50, y);

        doc.setDrawColor(180);
        doc.line(10, y + 6, 200, y + 6);

        // Medicine Table
        autoTable(doc, {
          startY: y + 12,
          head: [["#", "MEDICINE", "DOSAGE", "DURATION", "INSTRUCTIONS"]],
          body: prescription.items?.map((item, index) => [
            index + 1,
            getMedicineLabel(item) || item.medicineName || "",
            item.dosage,
            `${item.days} Day(s)`,
            item.instructions || "-",
          ]) || [],
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 12;
        if (prescription.notes) {
          doc.setFont(undefined, "bold");
          doc.text("Doctor Notes:", 15, finalY);
          doc.setFont(undefined, "normal");
          const splitNotes = doc.splitTextToSize(prescription.notes, 170);
          doc.text(splitNotes, 15, finalY + 6);
          finalY += splitNotes.length * 5 + 10;
        }

        // Signature Section
        const sigY = Math.max(finalY, 250);
        doc.line(130, sigY, 190, sigY);
        doc.setFont(undefined, "bold");
        doc.text(prescription.doctorName || "Doctor", 135, sigY + 6);
        doc.setFont(undefined, "normal");
        doc.text("Consultant Doctor", 135, sigY + 11);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text("Generated from Hospital Management System", centerX, 287, { align: "center" });

        doc.save(`Prescription_${prescription.visitNumber || prescription.id}.pdf`);
      };

      img.onerror = () => {
        alert("Hospital logo failed to load. Downloading PDF anyway.");
      };
    } catch (err) {
      console.error(err);
      alert("Failed to generate prescription PDF");
    }
  };

  const handlePrintPharmacyInvoice = async (saleId) => {
    try {
      const res = await api.get(`/api/pharmacy/${saleId}`);
      const billData = {
        ...res.data.invoice,
        items: res.data.items || [],
      };

      const doc = new jsPDF();
      const img = new Image();
      img.src = hospitalLogo;

      img.onload = () => {
        const logoWidth = 140;
        const logoHeight = 32;
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text("Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 44, { align: "center" });
        doc.line(10, 46, 200, 46);

        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.setFont(undefined, "bold");
        doc.text("PHARMACY BILL", centerX, 58, { align: "center" });

        let y = 70;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.setFont(undefined, "bold");
        doc.text("Patient Name", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(String(billData.patientName || "-"), 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Invoice No", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(String(billData.invoiceNumber || "-"), 160, y);

        y += 8;
        doc.setFont(undefined, "bold");
        doc.text("Mobile No", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(String(billData.mobile || "-"), 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Date", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(String(billData.saleDate ? billData.saleDate.split("T")[0] : "-"), 160, y);

        doc.line(10, y + 6, 200, y + 6);

        autoTable(doc, {
          startY: y + 10,
          head: [["#", "MEDICINE", "QTY", "UNIT PRICE", "TOTAL"]],
          body: billData.items.map((item, index) => [
            index + 1,
            item.medicineName,
            item.quantity,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(item.price || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(item.total || 0).toFixed(2)}`,
          ]),
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text(`Subtotal: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(billData.subtotal || 0).toFixed(2)}`, 140, finalY);
        doc.text(`GST: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(billData.gstAmount || 0).toFixed(2)}`, 140, finalY + 6);
        doc.text(`Discount: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(billData.discount || 0).toFixed(2)}`, 140, finalY + 12);
        
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text(`Grand Total: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(billData.finalAmount || 0).toFixed(2)}`, 140, finalY + 20);

        doc.save(`${billData.invoiceNumber || "PharmacyBill"}.pdf`);
      };
    } catch (err) {
      console.error(err);
      alert("Failed to load pharmacy bill details");
    }
  };

  const handlePrintMainInvoice = async (invoiceId) => {
    try {
      const res = await api.get(`/api/bills/${invoiceId}`);
      const inv = res.data.invoice;
      const items = res.data.items || [];

      const doc = new jsPDF();
      const img = new Image();
      img.src = hospitalLogo;

      img.onload = () => {
        const logoWidth = 140;
        const logoHeight = 32;
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text("Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 44, { align: "center" });
        doc.line(10, 46, 200, 46);

        doc.setFontSize(16);
        doc.setTextColor(30, 58, 138);
        doc.setFont(undefined, "bold");
        doc.text("INVOICE BILL", centerX, 58, { align: "center" });

        let y = 70;
        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.setFont(undefined, "bold");
        doc.text("Patient Name", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(String(patient?.name || "-"), 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Invoice No", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(String(inv.invoiceNumber || "-"), 160, y);

        y += 8;
        doc.setFont(undefined, "bold");
        doc.text("PRN", 15, y);
        doc.text(":", 45, y);
        doc.setFont(undefined, "normal");
        doc.text(String(patient?.patientCode || "-"), 50, y);

        doc.setFont(undefined, "bold");
        doc.text("Date", 125, y);
        doc.text(":", 155, y);
        doc.setFont(undefined, "normal");
        doc.text(String(inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "-"), 160, y);

        doc.line(10, y + 6, 200, y + 6);

        autoTable(doc, {
          startY: y + 10,
          head: [["#", "CHARGE NAME", "QTY", "RATE", "AMOUNT"]],
          body: items.map((item, index) => [
            index + 1,
            item.chargeName,
            item.quantity,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(item.rate || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(item.amount || 0).toFixed(2)}`,
          ]),
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text(`Subtotal: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(inv.subtotal || 0).toFixed(2)}`, 140, finalY);
        doc.text(`Discount: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(inv.discount || 0).toFixed(2)}`, 140, finalY + 6);
        doc.text(`Tax: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(inv.taxAmount || 0).toFixed(2)}`, 140, finalY + 12);
        
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text(`Grand Total: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(inv.totalAmount || 0).toFixed(2)}`, 140, finalY + 20);

        doc.save(`${inv.invoiceNumber || "MainInvoice"}.pdf`);
      };
    } catch (err) {
      console.error(err);
      alert("Failed to load invoice details");
    }
  };

  // ================= CONSOLIDATED DATE-RANGE REPORTS =================

  const handleDownloadOPDReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredV = visits.filter(v => {
      const d = new Date(v.visitDate);
      return d >= start && d <= end;
    });

    const filteredP = prescriptions.filter(p => {
      const d = new Date(p.prescriptionDate);
      return d >= start && d <= end;
    });

    const filteredL = labTests.filter(l => {
      const d = new Date(l.testDate);
      return d >= start && d <= end;
    });

    const doc = new jsPDF();
    const img = new Image();
    img.src = hospitalLogo;

    img.onload = () => {
      const logoWidth = 140;
      const logoHeight = 32;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text("Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 44, { align: "center" });
      doc.line(10, 46, 200, 46);

      doc.setFontSize(15);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("OPD CLINICAL SUMMARY REPORT", centerX, 56, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Period: ${startDate} to ${endDate}`, centerX, 62, { align: "center" });

      // Patient details block
      let y = 72;
      doc.setFillColor(245, 247, 250);
      doc.rect(10, y, 190, 26, "F");
      
      doc.setFont(undefined, "bold");
      doc.text("Patient Name :", 15, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.name || "-", 45, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("PRN :", 115, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.patientCode || "-", 130, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("Age / Gender :", 15, y + 18);
      doc.setFont(undefined, "normal");
      doc.text(`${patient?.age || "-"} Y / ${patient?.gender || "-"}`, 45, y + 18);

      doc.setFont(undefined, "bold");
      doc.text("Contact :", 115, y + 18);
      doc.setFont(undefined, "normal");
      doc.text(`${patient?.phone || "-"}`, 130, y + 18);

      y += 36;
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("1. OPD Visits Summary", 15, y);

      autoTable(doc, {
        startY: y + 4,
        head: [["VISIT NO", "DATE", "DOCTOR", "STATUS"]],
        body: filteredV.map(v => [
          v.visitNumber || "-",
          v.visitDate || "-",
          v.doctorName || "-",
          v.status || "-"
        ]),
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });

      y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("2. OPD Prescriptions Log", 15, y);

      const prescriptionItems = [];
      filteredP.forEach(p => {
        p.items?.forEach(item => {
          prescriptionItems.push([
            p.prescriptionDate || "-",
            p.doctorName || "-",
            getMedicineLabel(item) || item.medicineName || "-",
            item.dosage || "-",
            `${item.days || "-"} Days`,
            item.instructions || "-"
          ]);
        });
      });

      autoTable(doc, {
        startY: y + 4,
        head: [["DATE", "DOCTOR", "MEDICINE", "DOSAGE", "DURATION", "INSTRUCTIONS"]],
        body: prescriptionItems.length > 0 ? prescriptionItems : [["-", "-", "No prescriptions found in this period", "-", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });

      y = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("3. Lab Investigations Log", 15, y);

      autoTable(doc, {
        startY: y + 4,
        head: [["TEST NAME", "DATE", "STATUS"]],
        body: filteredL.map(l => [
          l.testName || "-",
          l.testDate || "-",
          l.status || "-"
        ]),
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });

      doc.save(`OPD_Report_${patient?.name?.replace(/\s+/g, "_")}_${startDate}_to_${endDate}.pdf`);
    };
  };

  const handleDownloadPharmacyReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredSales = pharmacy.filter(p => {
      const d = new Date(p.saleDate);
      return d >= start && d <= end;
    });

    const doc = new jsPDF();
    const img = new Image();
    img.src = hospitalLogo;

    img.onload = () => {
      const logoWidth = 140;
      const logoHeight = 32;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text("Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 44, { align: "center" });
      doc.line(10, 46, 200, 46);

      doc.setFontSize(15);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("PHARMACY BILLS STATEMENT", centerX, 56, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Period: ${startDate} to ${endDate}`, centerX, 62, { align: "center" });

      let y = 72;
      doc.setFillColor(245, 247, 250);
      doc.rect(10, y, 190, 24, "F");
      
      doc.setFont(undefined, "bold");
      doc.text("Patient Name :", 15, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.name || "-", 45, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("PRN :", 115, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.patientCode || "-", 130, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("Contact :", 15, y + 16);
      doc.setFont(undefined, "normal");
      doc.text(`${patient?.phone || "-"}`, 45, y + 16);

      y += 32;

      let grandTotal = 0;
      autoTable(doc, {
        startY: y,
        head: [["DATE", "INVOICE NUMBER", "SUBTOTAL", "TAX (GST)", "PAYMENT MODE", "TOTAL AMOUNT"]],
        body: filteredSales.map(s => {
          grandTotal += Number(s.finalAmount || 0);
          return [
            s.saleDate ? s.saleDate.split("T")[0] : "-",
            s.invoiceNumber || "-",
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(s.subtotal || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(s.gstAmount || 0).toFixed(2)}`,
            s.paymentMode || "CASH",
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(s.finalAmount || 0).toFixed(2)}`
          ];
        }),
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });

      let finalY = doc.lastAutoTable.finalY + 12;
      doc.setFont(undefined, "bold");
      doc.setFontSize(11);
      doc.text(`Total Purchases Count: ${filteredSales.length}`, 15, finalY);
      doc.text(`Grand Total Spent: ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${grandTotal.toFixed(2)}`, 125, finalY);

      doc.save(`Pharmacy_Statement_${patient?.name?.replace(/\s+/g, "_")}_${startDate}_to_${endDate}.pdf`);
    };
  };

  const handleDownloadBillingReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both Start Date and End Date");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredInvoices = invoices.filter(i => {
      const d = new Date(i.invoiceDate);
      return d >= start && d <= end;
    });

    const doc = new jsPDF();
    const img = new Image();
    img.src = hospitalLogo;

    img.onload = () => {
      const logoWidth = 140;
      const logoHeight = 32;
      const pageWidth = doc.internal.pageSize.getWidth();
      const centerX = pageWidth / 2;

      doc.addImage(img, "PNG", (pageWidth - logoWidth) / 2, 8, logoWidth, logoHeight);
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text("Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209", centerX, 44, { align: "center" });
      doc.line(10, 46, 200, 46);

      doc.setFontSize(15);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("MAIN BILLING STATEMENT", centerX, 56, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Period: ${startDate} to ${endDate}`, centerX, 62, { align: "center" });

      let y = 72;
      doc.setFillColor(245, 247, 250);
      doc.rect(10, y, 190, 24, "F");
      
      doc.setFont(undefined, "bold");
      doc.text("Patient Name :", 15, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.name || "-", 45, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("PRN :", 115, y + 8);
      doc.setFont(undefined, "normal");
      doc.text(patient?.patientCode || "-", 130, y + 8);

      doc.setFont(undefined, "bold");
      doc.text("Contact :", 15, y + 16);
      doc.setFont(undefined, "normal");
      doc.text(`${patient?.phone || "-"}`, 45, y + 16);

      y += 32;

      let subtotalSum = 0;
      let discountSum = 0;
      let taxSum = 0;
      let totalSum = 0;

      autoTable(doc, {
        startY: y,
        head: [["DATE", "INVOICE NUMBER", "VISIT NUMBER", "SUBTOTAL", "DISCOUNT", "TAX/GST", "FINAL AMOUNT"]],
        body: filteredInvoices.map(i => {
          subtotalSum += Number(i.subtotal || 0);
          discountSum += Number(i.discount || 0);
          taxSum += Number(i.taxAmount || 0);
          totalSum += Number(i.totalAmount || 0);

          return [
            i.invoiceDate ? i.invoiceDate.split("T")[0] : "-",
            i.invoiceNumber || "-",
            i.visitNumber || "-",
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(i.subtotal || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(i.discount || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(i.taxAmount || 0).toFixed(2)}`,
            `ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${Number(i.totalAmount || 0).toFixed(2)}`
          ];
        }),
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
        styles: { fontSize: 8 },
      });

      let finalY = doc.lastAutoTable.finalY + 12;
      doc.setFillColor(245, 247, 250);
      doc.rect(115, finalY, 85, 30, "F");

      doc.setFont(undefined, "bold");
      doc.setFontSize(9);
      doc.text(`Total Subtotal:  ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${subtotalSum.toFixed(2)}`, 120, finalY + 6);
      doc.text(`Total Discount: -ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${discountSum.toFixed(2)}`, 120, finalY + 12);
      doc.text(`Total Tax/GST:   ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${taxSum.toFixed(2)}`, 120, finalY + 18);
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text(`Grand Total:     ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹${totalSum.toFixed(2)}`, 120, finalY + 26);

      doc.save(`Main_Billing_Statement_${patient?.name?.replace(/\s+/g, "_")}_${startDate}_to_${endDate}.pdf`);
    };
  };

  // ================= UI CONDITIONAL RENDERING =================

  if (loading) {
    return (
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Loading Patient Profile...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, backgroundColor: palette.page, minHeight: "100vh" }}>
      <Paper elevation={0} sx={{ ...panelSx, p: { xs: 2, md: 2.5 }, mb: 2.5 }}>
        <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "#e0f2fe", color: "#075985", width: 54, height: 54 }}>
              <LocalHospitalIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: palette.ink, fontWeight: 950, letterSpacing: 0 }}>
                Patient Clinical Profile
              </Typography>
              <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 750 }}>
                Doctor-facing summary with demographics, risks, visits, prescriptions, labs, billing, pharmacy and reports in one place.
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }} sx={{ width: { xs: "100%", lg: "auto" } }}>
            <Autocomplete
              size="small"
              options={patientOptions}
              value={patientOptions.find((option) => String(option.id) === String(patient?.id)) || null}
              inputValue={search}
              onInputChange={(_, value) => setSearch(value)}
              onChange={(_, selectedPatient) => {
                if (!selectedPatient) {
                  setSearch("");
                  return;
                }
                setSearch(`${selectedPatient.patientCode || `PRN${selectedPatient.id}`} - ${selectedPatient.name || "Patient"}`);
                loadProfile(selectedPatient.id);
              }}
              getOptionLabel={(option) => `${option.patientCode || `PRN${option.id}`} - ${option.name || "Unnamed patient"}`}
              isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 850 }}>
                      {option.patientCode || `PRN${option.id}`} - {option.name || "Unnamed patient"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: palette.muted }}>
                      {option.phone || option.mobile || "No mobile number"}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search patient by PRN, name, or mobile"
                  onKeyDown={(event) => event.key === "Enter" && handleSearchPatient()}
                />
              )}
              sx={{ minWidth: { xs: "100%", sm: 360 }, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff" } }}
            />
            <Button variant="contained" onClick={handleSearchPatient} sx={{ borderRadius: 2, height: 40, px: 3, textTransform: "none", fontWeight: 900, bgcolor: palette.blue }}>
              Search
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {!patient ? (
        <Paper elevation={0} sx={{ ...panelSx, p: { xs: 4, md: 8 }, textAlign: "center" }}>
          <Avatar sx={{ width: 64, height: 64, mx: "auto", mb: 2, bgcolor: "#e0f2fe", color: "#075985" }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6" sx={{ color: palette.ink, fontWeight: 950, mb: 1 }}>
            No Patient Selected
          </Typography>
          <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 700 }}>
            Enter the patient PRN or numeric patient ID to open the complete clinical and financial record.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          <Paper elevation={0} sx={{ ...panelSx, overflow: "hidden" }}>
            <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 }, background: "linear-gradient(135deg, #0f3f68 0%, #0e7490 100%)", color: "#fff" }}>
              <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", lg: "center" }} spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "center", sm: "center" }}>
                  <Box sx={{ position: "relative", width: 112, height: 112, flex: "0 0 auto" }}>
                    <Avatar src={photo || undefined} sx={{ width: 112, height: 112, border: "4px solid rgba(255,255,255,0.85)", bgcolor: "rgba(255,255,255,0.2)", fontSize: 42, fontWeight: 950 }}>
                      {!photo && (patient?.name ? patient.name.charAt(0).toUpperCase() : "?")}
                    </Avatar>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: "none" }} />
                    <IconButton onClick={handlePhotoUploadClick} size="small" sx={{ position: "absolute", right: 2, bottom: 2, bgcolor: "#fff", color: palette.blue, border: "1px solid rgba(15,23,42,0.12)", "&:hover": { bgcolor: "#e0f2fe" } }}>
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "center", sm: "center" }} sx={{ mb: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: 0 }}>
                        {patient?.name || "Patient"}
                      </Typography>
                      <Chip label={patientCode} sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)", fontWeight: 900 }} />
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                      <Chip icon={<CakeIcon />} label={`${patient?.age || "-"} Y / ${patient?.gender || "-"}`} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800, "& .MuiChip-icon": { color: "#fff" } }} />
                      <Chip icon={<BloodtypeIcon />} label={patient?.bloodGroup || "Blood group not set"} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800, "& .MuiChip-icon": { color: "#fff" } }} />
                      <Chip icon={<PhoneIcon />} label={patient?.phone || "No phone"} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800, "& .MuiChip-icon": { color: "#fff" } }} />
                    </Stack>
                  </Box>
                </Stack>

                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", minWidth: { lg: 320 } }}>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.78)", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 }}>
                    Current Clinical Context
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 850, mt: 0.75 }}>
                    Last doctor: {latestVisit?.doctorName || latestPrescription?.doctorName || "-"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 850 }}>
                    Last visit: {formatDate(latestVisit?.visitDate || latestPrescription?.prescriptionDate)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 850 }}>
                    Latest lab: {latestLabTest?.testName || "-"} {latestLabTest?.status ? `(${latestLabTest.status})` : ""}
                  </Typography>
                </Paper>
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <InfoPanel title="Demographics" icon={PersonIcon} tone={palette.blue}>
                    <Stack spacing={1.1}>
                      <DetailLine label="Patient Code" value={patientCode} strong />
                      <DetailLine label="Date of Birth" value={formatDate(patient?.dateOfBirth)} />
                      <DetailLine label="Email" value={patient?.email} />
                      <DetailLine label="Marital Status" value={patient?.maritalStatus} />
                      <DetailLine label="Occupation" value={patient?.occupation} />
                      <DetailLine label="Registered" value={formatDate(patient?.registrationDate)} />
                    </Stack>
                  </InfoPanel>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  <InfoPanel title="Risk & History" icon={WarningAmberIcon} tone={patient?.allergies ? palette.red : palette.green}>
                    <Stack spacing={1.5}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: patient?.allergies ? "#fef2f2" : "#f0fdf4", border: `1px solid ${patient?.allergies ? "#fecaca" : "#bbf7d0"}` }}>
                        <Typography variant="caption" sx={{ color: patient?.allergies ? palette.red : palette.green, fontWeight: 950, textTransform: "uppercase", letterSpacing: 0 }}>
                          Allergies
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.ink, fontWeight: 850, mt: 0.5 }}>
                          {allergyText}
                        </Typography>
                      </Box>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: patient?.chronicDiseases ? "#fffbeb" : "#f8fafc", border: `1px solid ${patient?.chronicDiseases ? "#fde68a" : palette.line}` }}>
                        <Typography variant="caption" sx={{ color: patient?.chronicDiseases ? palette.amber : palette.muted, fontWeight: 950, textTransform: "uppercase", letterSpacing: 0 }}>
                          Chronic Conditions
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.ink, fontWeight: 850, mt: 0.5 }}>
                          {chronicText}
                        </Typography>
                      </Box>
                    </Stack>
                  </InfoPanel>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  <InfoPanel title="Contact & Emergency" icon={PhoneIcon} tone={palette.cyan}>
                    <Stack spacing={1.1}>
                      <DetailLine label="Mobile" value={patient?.phone || patient?.mobile} strong />
                      <DetailLine label="Emergency" value={patient?.emergencyContactName} />
                      <DetailLine label="Emergency Ph" value={patient?.emergencyContactNumber} />
                      <DetailLine label="Address" value={patient?.address ? `${patient.address}${patient.city ? `, ${patient.city}` : ""}${patient.state ? `, ${patient.state}` : ""}${patient.pincode ? ` - ${patient.pincode}` : ""}` : "-"} />
                    </Stack>
                  </InfoPanel>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          <Grid container spacing={2}>
            {patientKpis.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.title}>
                <KpiCard {...item} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <InfoPanel title="Latest Visit" icon={MedicalServicesIcon} tone={palette.blue}>
                <Stack spacing={1.1}>
                  <DetailLine label="Visit No" value={latestVisit?.visitNumber} strong />
                  <DetailLine label="Date" value={formatDate(latestVisit?.visitDate)} />
                  <DetailLine label="Doctor" value={latestVisit?.doctorName} />
                  <DetailLine label="Status" value={latestVisit?.status || "-"} />
                </Stack>
              </InfoPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <InfoPanel title="Medication Summary" icon={LocalPharmacyIcon} tone={palette.green}>
                <Stack spacing={1.1}>
                  <DetailLine label="Prescriptions" value={prescriptions.length} strong />
                  <DetailLine label="Medicines" value={medicineCount} />
                  <DetailLine label="Last RX" value={latestPrescription ? `RX-${latestPrescription.id}` : "-"} />
                  <DetailLine label="RX Doctor" value={latestPrescription?.doctorName} />
                </Stack>
              </InfoPanel>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <InfoPanel title="Financial Snapshot" icon={AssignmentIcon} tone={palette.violet}>
                <Stack spacing={1.1}>
                  <DetailLine label="Main Bills" value={formatAmount(invoiceTotal)} strong />
                  <DetailLine label="Pharmacy" value={formatAmount(pharmacyTotal)} />
                  <DetailLine label="Procedures" value={formatAmount(procedureTotal)} />
                  <DetailLine label="Invoices" value={`${invoices.length} main / ${pharmacy.length} pharmacy`} />
                </Stack>
              </InfoPanel>
            </Grid>
          </Grid>
            {/* TAB CONTAINER */}
            <Card sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}>
              <Tabs
                value={tab}
                onChange={(e, v) => setTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: "1px solid #E2E8F0",
                  px: 2,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                    minWidth: "100px",
                    py: 2,
                  },
                }}
              >
                <Tab label="Overview" />
                <Tab label="Visits" />
                <Tab label="Prescriptions" />
                <Tab label="Lab Reports" />
                <Tab label="Pharmacy Purchases" />
                <Tab label="Procedures" />
                <Tab label="Bills & Invoices" />
                <Tab label="Physio Log" />
                <Tab label="Reports & Statements" sx={{ color: "#1E40AF", fontWeight: 700 }} />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {/* 0. OVERVIEW */}
                {tab === 0 && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#1E40AF" sx={{ mb: 1.5 }}>
                        Patient Bio-Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        This dashboard summarizes the clinical history, pharmacy dispensaries, physiotherapy journals, and invoicing history of {patient?.name}. Use the tabs to browse specific logs or print individual files.
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px" }}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Registration Details</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Date of Birth:</strong> {patient?.dateOfBirth || "N/A"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Registered On:</strong> {patient?.registrationDate ? patient.registrationDate.split("T")[0] : "N/A"}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: "10px" }}>
                          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Notes & Remarks</Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {patient?.remarks || "No clinical remarks added."}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Stack>
                )}

                {/* 1. VISITS */}
                {tab === 1 && (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Visit No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Consultant Doctor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredVisits.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              No visit records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredVisits.map((v) => {
                            // Find corresponding prescription if any
                            const matchPresc = prescriptions.find(p => p.visitNumber === v.visitNumber);
                            return (
                              <TableRow key={v.id}>
                                <TableCell fontWeight={600}>{v.visitNumber}</TableCell>
                                <TableCell>{v.visitDate}</TableCell>
                                <TableCell><strong>{v.doctorName}</strong></TableCell>
                                <TableCell>
                                  <Chip label={v.status} color="success" size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="center">
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={!matchPresc}
                                    startIcon={<PrintIcon />}
                                    onClick={() => handlePrintPrescription(matchPresc)}
                                    sx={{ borderRadius: "8px", textTransform: "none" }}
                                  >
                                    Prescription
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* 2. PRESCRIPTIONS */}
                {tab === 2 && (
                  <Stack spacing={3}>
                    {prescriptions.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: "center", borderRadius: "12px" }}>
                        <Typography color="text.secondary">No prescriptions found</Typography>
                      </Paper>
                    ) : (
                      prescriptions.map((p) => (
                        <Card key={p.id} variant="outlined" sx={{ borderRadius: 3, border: "1px solid #E2E8F0" }}>
                          <CardContent sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700} color="#1E40AF">
                                  Prescription RX-{p.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Date: {p.prescriptionDate} | Visit No: {p.visitNumber || "-"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Doctor: <strong>{p.doctorName}</strong>
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => handlePrintPrescription(p)}
                                sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#1E40AF" }}
                              >
                                Download PDF
                              </Button>
                            </Stack>

                            <Divider sx={{ my: 1.5 }} />

                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                              Medicines Prescribed:
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #F1F5F9", borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Medicine</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Dosage</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Instructions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {p.items && p.items.length > 0 ? (
                                    p.items.map((item, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{getMedicineLabel(item) || item.medicineName}</TableCell>
                                        <TableCell>{item.dosage}</TableCell>
                                        <TableCell>{item.days} Day(s)</TableCell>
                                        <TableCell>{item.instructions || "-"}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={4} align="center">
                                        No medicines found in this prescription details.
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {p.notes && (
                              <Box sx={{ mt: 2, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Doctor Notes:</strong> {p.notes}
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Stack>
                )}

                {/* 3. LAB REPORTS */}
                {tab === 3 && (
                  <Stack spacing={2.5}>
                    <Paper elevation={0} sx={{ ...panelSx, p: 2 }}>
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                            <Avatar sx={{ bgcolor: "#e0f2fe", color: palette.blue }}>
                              <ImageIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ color: palette.ink, fontWeight: 950 }}>
                                X-Ray Film Preview
                              </Typography>
                              <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 700 }}>
                                Latest X-Ray image is shown here so the doctor can review the film without leaving the patient profile.
                              </Typography>
                            </Box>
                          </Stack>

                          {featuredXray ? (
                            <Stack spacing={0.75}>
                              <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 800 }}>
                                X-Ray: <strong>{featuredXray.testName || "Radiology film"}</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 800 }}>
                                Date: {formatDate(featuredXray.testDate)} | Status: {featuredXray.status || "-"}
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<VisibilityIcon />}
                                href={featuredXrayUrl || undefined}
                                target="_blank"
                                disabled={!featuredXrayUrl}
                                sx={{ alignSelf: "flex-start", mt: 1, borderRadius: 2, textTransform: "none", fontWeight: 900, bgcolor: palette.blue }}
                              >
                                View X-Ray Film
                              </Button>
                            </Stack>
                          ) : (
                            <Typography variant="body2" sx={{ color: palette.muted, fontWeight: 800 }}>
                              No X-Ray film has been attached for this patient yet.
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ width: { xs: "100%", md: 360 }, minHeight: 220, borderRadius: 2, border: `1px solid ${palette.line}`, bgcolor: "#020617", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {featuredXrayUrl && isImageFilm(featuredXrayUrl, featuredXray?.fileContentType) ? (
                            <Box component="img" src={featuredXrayUrl} alt={`X-Ray - ${featuredXray?.testName || "film"}`} sx={{ width: "100%", height: "100%", maxHeight: 260, objectFit: "contain", display: "block" }} />
                          ) : (
                            <Stack alignItems="center" spacing={1} sx={{ color: "#cbd5e1", p: 3, textAlign: "center" }}>
                              <ImageIcon sx={{ fontSize: 48 }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                X-Ray Preview
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700 }}>
                                {featuredXrayUrl ? "Film opens in viewer. Image preview is available for JPG/PNG/WebP files." : "No film image attached"}
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                    </Paper>

                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                      <Table>
                        <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Test Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Report</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">X-Ray Film</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {labTests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                No lab tests ordered.
                              </TableCell>
                            </TableRow>
                          ) : (
                            labTests.map((l) => {
                              const filmUrl = getXrayFilmUrl(l);
                              const showXrayAction = isXrayTest(l) || Boolean(filmUrl);
                              return (
                                <TableRow key={l.id}>
                                  <TableCell sx={{ fontWeight: 800 }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {showXrayAction && <ImageIcon fontSize="small" sx={{ color: palette.blue }} />}
                                      <span>{l.testName}</span>
                                    </Stack>
                                  </TableCell>
                                  <TableCell>{formatDate(l.testDate)}</TableCell>
                                  <TableCell>
                                    <Chip label={l.status} color="warning" size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<DownloadIcon />}
                                      href={l.reportUrl}
                                      target="_blank"
                                      disabled={!l.reportUrl}
                                      sx={{ borderRadius: "8px", textTransform: "none" }}
                                    >
                                      PDF
                                    </Button>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Button
                                      variant={showXrayAction ? "contained" : "outlined"}
                                      size="small"
                                      startIcon={<VisibilityIcon />}
                                      href={filmUrl || undefined}
                                      target="_blank"
                                      disabled={!filmUrl}
                                      sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 850, bgcolor: showXrayAction && filmUrl ? palette.blue : undefined }}
                                    >
                                      View X-Ray Film
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Stack>
                )}

                {/* 4. PHARMACY PURCHASES */}
                {tab === 4 && (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Invoice No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>GST</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Total Spent</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pharmacy.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              No pharmacy bills found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          pharmacy.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell fontWeight={600}>{p.invoiceNumber}</TableCell>
                              <TableCell>{p.saleDate?.split("T")[0]}</TableCell>
                              <TableCell>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{p.subtotal}</TableCell>
                              <TableCell>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{p.gstAmount}</TableCell>
                              <TableCell fontWeight={600} color="#1E40AF">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{p.finalAmount}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="error"
                                  onClick={() => handlePrintPharmacyInvoice(p.id)}
                                  title="Download PDF Invoice"
                                >
                                  <PictureAsPdfIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* 5. PROCEDURES */}
                {tab === 5 && (
                  <Box>
                    {procedures.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: "center", borderRadius: "12px" }}>
                        <Typography color="text.secondary">No procedure bills found</Typography>
                      </Paper>
                    ) : (
                      procedures.map((bill, index) => (
                        <Card key={bill.id || index} sx={{ mb: 3, borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                          <Box sx={{ px: 3, py: 1.5, background: "linear-gradient(90deg, #1E40AF 0%, #2563EB 100%)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              Procedure Bill #{bill.id}
                            </Typography>
                            <Typography variant="body2">
                              Visit ID: {bill.visitId || "N/A"}
                            </Typography>
                          </Box>
                          <CardContent>
                            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
                              <Table size="small">
                                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 650 }}>Procedure</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 650 }}>Qty</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 650 }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 650 }}>Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {bill.items?.map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{item.procedureName}</TableCell>
                                      <TableCell align="center">{item.quantity || 1}</TableCell>
                                      <TableCell align="right">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{Number(item.unitPrice || item.amount || 0).toFixed(2)}</TableCell>
                                      <TableCell align="right">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{Number(item.amount || 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                              <Box sx={{ p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, minWidth: 200, textAlign: "right", border: "1px solid #E2E8F0" }}>
                                <Typography variant="caption" color="text.secondary">TOTAL BILL AMOUNT</Typography>
                                <Typography variant="h6" fontWeight={700} color="#1E40AF">
                                  ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{Number(bill.finalAmount || 0).toFixed(2)}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Box>
                )}

                {/* 6. BILLS & INVOICES */}
                {tab === 6 && (
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Invoice No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Visit No</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Grand Total</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              No main bill invoices found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          invoices.map((i) => (
                            <TableRow key={i.id}>
                              <TableCell fontWeight={600}>{i.invoiceNumber}</TableCell>
                              <TableCell>{i.visitNumber}</TableCell>
                              <TableCell>{i.invoiceDate?.split("T")[0]}</TableCell>
                              <TableCell fontWeight={600} color="#1E40AF">ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{i.totalAmount}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  color="error"
                                  onClick={() => handlePrintMainInvoice(i.id)}
                                  title="Download Main PDF Invoice"
                                >
                                  <PictureAsPdfIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* 7. PHYSIO LOG */}
                {tab === 7 && (
                  <Stack spacing={2}>
                    {physio.length === 0 ? (
                      <Paper sx={{ p: 4, textAlign: "center", borderRadius: "12px" }}>
                        <Typography color="text.secondary">No physiotherapy sessions recorded</Typography>
                      </Paper>
                    ) : (
                      physio.map((s) => (
                        <Card key={s.id} variant="outlined" sx={{ borderRadius: "10px" }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700} color="#1E40AF">
                              Physiotherapy Session #{s.sessionNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Date: {s.date} | Therapist: <strong>{s.therapistName}</strong>
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2">
                              <strong>Notes:</strong> {s.notes}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Stack>
                )}

                {/* 8. REPORTS & STATEMENTS GENERATOR */}
                {tab === 8 && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="#1E40AF">
                        Date-wise Statement & Summary Generator
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Select a date range to generate consolidated reports for this patient's visits, pharmacy bills, and financial statements.
                      </Typography>
                    </Box>

                    <Paper variant="outlined" sx={{ p: 3, borderRadius: "12px", bgcolor: "#F8FAFC" }}>
                      <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: "#fff" }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            size="small"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ bgcolor: "#fff" }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            CHOSEN RANGE:
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {startDate || "Not Set"} to {endDate || "Not Set"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Grid container spacing={3}>
                      {/* OPD Report */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: "12px", height: "100%", display: "flex", flexDirection: "column" }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#1E40AF" gutterBottom>
                              OPD Clinical Report
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Consolidates patient details, visit schedules, consultant doctors, prescribing logs, and ordered lab tests.
                            </Typography>
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<DescriptionIcon />}
                              onClick={handleDownloadOPDReport}
                              sx={{ bgcolor: "#1E40AF", textTransform: "none", borderRadius: "8px" }}
                            >
                              Download OPD PDF
                            </Button>
                          </Box>
                        </Card>
                      </Grid>

                      {/* Pharmacy Report */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: "12px", height: "100%", display: "flex", flexDirection: "column" }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#10B981" gutterBottom>
                              Pharmacy Ledger Statement
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Summarizes all pharmacy purchases, medicine quantities, unit rates, taxes, payment modes, and totals.
                            </Typography>
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<LocalPharmacyIcon />}
                              onClick={handleDownloadPharmacyReport}
                              sx={{ bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" }, textTransform: "none", borderRadius: "8px" }}
                            >
                              Download Pharmacy PDF
                            </Button>
                          </Box>
                        </Card>
                      </Grid>

                      {/* Financial Statement */}
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Card variant="outlined" sx={{ borderRadius: "12px", height: "100%", display: "flex", flexDirection: "column" }}>
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#8B5CF6" gutterBottom>
                              Billing & Revenue Statement
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Lists main invoicing records, consulting and registration fee tallies, discounts, and net revenue logs.
                            </Typography>
                          </CardContent>
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<ReceiptIcon />}
                              onClick={handleDownloadBillingReport}
                              sx={{ bgcolor: "#8B5CF6", "&:hover": { bgcolor: "#7C3AED" }, textTransform: "none", borderRadius: "8px" }}
                            >
                              Download Billing PDF
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Box>
            </Card>
        </Stack>
      )}
    </Box>
  );
}
