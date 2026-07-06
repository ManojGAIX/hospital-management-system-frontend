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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import HealingIcon from "@mui/icons-material/Healing";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";

export default function PatientProfile() {
  const { patientId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!patientId);
  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [tab, setTab] = useState(0);
  
  // Date range picker states for statements
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fileInputRef = useRef(null);

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

  const loadProfile = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/patientprofile/${id}`);
      setPatient(res.data.patient);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile. Make sure the patient ID exists.");
    } finally {
      setLoading(false);
    }
  };


  const handleSearchPatient = async () => {
    if (!search.trim()) return;
    try {
      const clean = search.replace(/\D/g, "");
      loadProfile(clean);
    } catch (err) {
      setPatient(null);
      alert("Patient not found");
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
  const labTests = data?.labTests || [];
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
            item.medicineName,
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
            `₹${Number(item.price || 0).toFixed(2)}`,
            `₹${Number(item.total || 0).toFixed(2)}`,
          ]),
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text(`Subtotal: ₹${Number(billData.subtotal || 0).toFixed(2)}`, 140, finalY);
        doc.text(`GST: ₹${Number(billData.gstAmount || 0).toFixed(2)}`, 140, finalY + 6);
        doc.text(`Discount: ₹${Number(billData.discount || 0).toFixed(2)}`, 140, finalY + 12);
        
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text(`Grand Total: ₹${Number(billData.finalAmount || 0).toFixed(2)}`, 140, finalY + 20);

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
            `₹${Number(item.rate || 0).toFixed(2)}`,
            `₹${Number(item.amount || 0).toFixed(2)}`,
          ]),
          theme: "grid",
          headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
          styles: { fontSize: 9, cellPadding: 3 },
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text(`Subtotal: ₹${Number(inv.subtotal || 0).toFixed(2)}`, 140, finalY);
        doc.text(`Discount: ₹${Number(inv.discount || 0).toFixed(2)}`, 140, finalY + 6);
        doc.text(`Tax: ₹${Number(inv.taxAmount || 0).toFixed(2)}`, 140, finalY + 12);
        
        doc.setFontSize(11);
        doc.setTextColor(30, 58, 138);
        doc.text(`Grand Total: ₹${Number(inv.totalAmount || 0).toFixed(2)}`, 140, finalY + 20);

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
            item.medicineName || "-",
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
            `₹${Number(s.subtotal || 0).toFixed(2)}`,
            `₹${Number(s.gstAmount || 0).toFixed(2)}`,
            s.paymentMode || "CASH",
            `₹${Number(s.finalAmount || 0).toFixed(2)}`
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
      doc.text(`Grand Total Spent: ₹${grandTotal.toFixed(2)}`, 125, finalY);

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
            `₹${Number(i.subtotal || 0).toFixed(2)}`,
            `₹${Number(i.discount || 0).toFixed(2)}`,
            `₹${Number(i.taxAmount || 0).toFixed(2)}`,
            `₹${Number(i.totalAmount || 0).toFixed(2)}`
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
      doc.text(`Total Subtotal:  ₹${subtotalSum.toFixed(2)}`, 120, finalY + 6);
      doc.text(`Total Discount: -₹${discountSum.toFixed(2)}`, 120, finalY + 12);
      doc.text(`Total Tax/GST:   ₹${taxSum.toFixed(2)}`, 120, finalY + 18);
      doc.setFontSize(10);
      doc.setTextColor(30, 58, 138);
      doc.text(`Grand Total:     ₹${totalSum.toFixed(2)}`, 120, finalY + 26);

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
    <Box sx={{ p: 3, maxWidth: "1600px", margin: "0 auto" }}>
      {/* SEARCH AND QUICK BAR */}
      <Card sx={{ mb: 3, borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: "20px !important" }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "#1E40AF", width: 44, height: 44 }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700} color="#1E40AF">
                  Patient Medical Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access comprehensive OPD history, pharmacy sales, billing ledgers, and export statements.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", md: "auto" } }}>
              <TextField
                size="small"
                placeholder="Search PRN / Patient ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
                sx={{
                  width: { xs: "100%", md: 240 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchPatient}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor: "#1E40AF",
                  px: 3,
                  "&:hover": { bgcolor: "#1D4ED8" },
                }}
              >
                Search
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {!patient ? (
        <Paper sx={{ p: 8, textAlign: "center", borderRadius: "16px" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No Patient Selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the search box above to enter a Patient PRN (e.g., numbers) to view their clinical records and download reports.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* LEFT SIDEBAR: PROFILE & MEDICAL DETAILS CARD */}
          <Grid item xs={12} md={3.5}>
            <Card sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", boxShadow: "0 8px 30px rgba(0,0,0,0.06)", position: "sticky", top: "24px" }}>
              {/* TOP HEADER GRADIENT */}
              <Box sx={{ background: "linear-gradient(135deg, #1E40AF 0%, #06B6D4 100%)", p: 3, textAlign: "center", color: "#fff", position: "relative" }}>
                {/* Photo Upload Container */}
                <Box sx={{ position: "relative", width: 110, height: 110, margin: "0 auto 12px auto" }}>
                  <Avatar
                    src={photo || undefined}
                    sx={{
                      width: 110,
                      height: 110,
                      border: "4px solid rgba(255,255,255,0.8)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                      bgcolor: "#2563EB",
                      fontSize: "2.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {!photo && (patient?.name ? patient.name.charAt(0).toUpperCase() : "?")}
                  </Avatar>
                  
                  {/* HIDDEN FILE INPUT */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />

                  {/* CAMERA OVERLAY BUTTON */}
                  <IconButton
                    onClick={handlePhotoUploadClick}
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      bgcolor: "#1E40AF",
                      color: "#fff",
                      border: "2px solid #fff",
                      "&:hover": { bgcolor: "#2563EB" },
                      width: 32,
                      height: 32,
                    }}
                  >
                    <PhotoCameraIcon fontSize="inherit" />
                  </IconButton>
                </Box>

                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {patient?.name}
                </Typography>
                <Chip
                  label={patient?.patientCode || `PRN-${patient?.id}`}
                  sx={{
                    mt: 1,
                    color: "#fff",
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                  }}
                />
              </Box>

              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#1E40AF" sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Personal Information
                </Typography>
                <Stack spacing={1.2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Age / Gender:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.age} Yrs / {patient?.gender}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Blood Group:</Typography>
                    <Typography variant="body2" fontWeight={600} color="error.main">{patient?.bloodGroup || "Not Set"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Phone:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.phone || "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Email:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.email || "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Marital Status:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.maritalStatus || "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Occupation:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.occupation || "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Address:</Typography>
                    <Typography variant="body2" fontWeight={600} align="right" sx={{ maxWidth: "160px" }}>
                      {patient?.address ? `${patient.address}, ${patient.city || ""}` : "-"}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Typography variant="subtitle1" fontWeight={700} color="#1E40AF" sx={{ mb: 1.5, display: "flex", alignItems: "center" }}>
                  <HealingIcon sx={{ mr: 1, fontSize: 20 }} /> Clinical Context
                </Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>ALLERGIES</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: "#FEF2F2", borderColor: "#FEE2E2", borderRadius: "8px" }}>
                      <Typography variant="body2" color="#B91C1C" fontWeight={600}>
                        {patient?.allergies || "None Reported"}
                      </Typography>
                    </Paper>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>CHRONIC CONDITIONS</Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: "#FFFBEB", borderColor: "#FEF3C7", borderRadius: "8px" }}>
                      <Typography variant="body2" color="#B45309" fontWeight={600}>
                        {patient?.chronicDiseases || "None Listed"}
                      </Typography>
                    </Paper>
                  </Box>

                  <Box display="flex" justifyContent="space-between" sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">Emergency Contact:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.emergencyContactName || "-"}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Emergency Ph:</Typography>
                    <Typography variant="body2" fontWeight={600}>{patient?.emergencyContactNumber || "-"}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT MAIN PANEL: METRICS & TABS */}
          <Grid item xs={12} md={8.5}>
            {/* STATS STRIP */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { title: "OPD Visits", value: kpis.visits, color: "#2563EB", label: "Consultations" },
                { title: "Pharmacy Purchases", value: kpis.pharmacy, color: "#10B981", label: "Invoices" },
                { title: "Billing Invoices", value: kpis.invoices, color: "#8B5CF6", label: "Ledgers" },
                { title: "Total Revenue Spent", value: `₹${Number(kpis.revenue || 0).toLocaleString()}`, color: "#EF4444", label: "All Receipts" },
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ borderRadius: "14px", border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                    <CardContent sx={{ p: "16px !important" }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
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
                      <Grid item xs={12} sm={6}>
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
                      <Grid item xs={12} sm={6}>
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
                                        <TableCell>{item.medicineName}</TableCell>
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
                  <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                    <Table>
                      <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Test Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Test Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="center">Download</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {labTests.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                              No lab tests ordered.
                            </TableCell>
                          </TableRow>
                        ) : (
                          labTests.map((l) => (
                            <TableRow key={l.id}>
                              <TableCell fontWeight={600}>{l.testName}</TableCell>
                              <TableCell>{l.testDate}</TableCell>
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
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                              <TableCell>₹{p.subtotal}</TableCell>
                              <TableCell>₹{p.gstAmount}</TableCell>
                              <TableCell fontWeight={600} color="#1E40AF">₹{p.finalAmount}</TableCell>
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
                                      <TableCell align="right">₹{Number(item.unitPrice || item.amount || 0).toFixed(2)}</TableCell>
                                      <TableCell align="right">₹{Number(item.amount || 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                              <Box sx={{ p: 1.5, bgcolor: "#F8FAFC", borderRadius: 2, minWidth: 200, textAlign: "right", border: "1px solid #E2E8F0" }}>
                                <Typography variant="caption" color="text.secondary">TOTAL BILL AMOUNT</Typography>
                                <Typography variant="h6" fontWeight={700} color="#1E40AF">
                                  ₹{Number(bill.finalAmount || 0).toFixed(2)}
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
                              <TableCell fontWeight={600} color="#1E40AF">₹{i.totalAmount}</TableCell>
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
                        <Grid item xs={12} sm={4}>
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
                        <Grid item xs={12} sm={4}>
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
                        <Grid item xs={12} sm={4}>
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
                      <Grid item xs={12} md={4}>
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
                      <Grid item xs={12} md={4}>
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
                      <Grid item xs={12} md={4}>
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
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
