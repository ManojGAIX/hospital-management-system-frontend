import React, { useState, useEffect } from "react";

import {
  Box,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { useNavigate } from "react-router-dom";

import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function PatientBilling() {
  const [search, setSearch] = useState("");

  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedVisitId, setSelectedVisitId] = useState("");

  const [isSaved, setIsSaved] = useState(false);

  const [availableCharges, setAvailableCharges] = useState([]);
  const [selectedCharge, setSelectedCharge] = useState("");
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  //  const [grandTotal, setGrandTotal] = useState(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [splitPayment, setSplitPayment] = useState({
    cashAmount: "",
    upiAmount: "",
    cardAmount: "",
  });

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
    if (location.state?.patientId) {
      const patientId = location.state.patientId;

      const formattedPRN = `PRN${String(patientId).padStart(4, "0")}`;

      setPrn(formattedPRN);

      handleSearch(formattedPRN);
    }
  }, []);

  // ======================================================
  // Additional Charges
  // ======================================================

  useEffect(() => {
    loadAdditionalCharges();
  }, []);

  const loadAdditionalCharges = async () => {
    try {
      const res = await api.get("/api/configs/category/BILLING");

      setAvailableCharges(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCharge = () => {
    if (!selectedCharge) return;

    const charge = availableCharges.find((c) => c.configKey === selectedCharge);

    if (!charge) return;

    const alreadyAdded = additionalCharges.some(
      (c) => c.configKey === charge.configKey,
    );

    if (alreadyAdded) {
      alert("Charge already added");
      return;
    }

    setAdditionalCharges((prev) => [
      ...prev,
      {
        configKey: charge.configKey,
        chargeName: charge.configKey.replaceAll("_", " "),
        qty: 1,
        amount: Number(charge.configValue),
      },
    ]);

    setSelectedCharge("");
  };

  const handleRemoveCharge = (key) => {
    setAdditionalCharges(additionalCharges.filter((c) => c.configKey !== key));
  };

  // ======================================================
  // CLINIC INFO
  // ======================================================

  const [billData, setBillData] = useState({
    medicineItems: [],
    labItems: [],
    additionalCharges: [],
    physioItems: [],
    opdItems: [],
    totalAmount: 0,
    bedCharge: 0,
    discount: 0,
    patientName: "",
    invoiceNumber: "",
  });

  // ======================================================
  // SAFE NUMBER
  // ======================================================

  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // ===========================
  // TOTAL CALCULATION
  // ===========================

  const additionalTotal = additionalCharges.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const medicineTotal =
    billData.medicineItems?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    ) || 0;

  const labTotal =
    billData.labItems?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    ) || 0;

  const physioTotal =
    billData.physioItems?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    ) || 0;

  const opdTotal =
    billData.opdItems?.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0,
    ) || 0;

  const bedTotal = Number(billData.bedCharge || 0);

  const subtotalAmount =
    medicineTotal +
    labTotal +
    physioTotal +
    bedTotal +
    opdTotal +
    additionalTotal;

  const grandTotalAmount = subtotalAmount - Number(discount || 0);
  const splitPaymentTotal =
    Number(splitPayment.cashAmount || 0) +
    Number(splitPayment.upiAmount || 0) +
    Number(splitPayment.cardAmount || 0);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ======================================================
  // LOAD PATIENTS
  // ======================================================

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/patients");
      setPatients(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // SELECTED VISIT
  // ======================================================

  const selectedVisit = visits.find(
    (v) => String(v.id) === String(selectedVisitId),
  );

  // ======================================================
  // SEARCH PATIENT
  // ======================================================

  const handlePatientSearch = async () => {
    if (!search) return;

    const cleanValue = search.replace(/\D/g, "");

    const patient = patients.find(
      (p) =>
        String(p.id) === cleanValue ||
        p.mobile?.includes(search) ||
        p.name?.toLowerCase().includes(search.toLowerCase()),
    );

    if (!patient) {
      alert("Patient not found");
      return;
    }

    setSelectedPatient(patient);

    try {
      const res = await api.get(`/api/visits/active/${patient.id}`);

      setVisits(res.data);

      // AUTO SELECT LATEST VISIT

      if (res.data.length > 0) {
        setSelectedVisitId(res.data[0].id);
      } else {
        setSelectedVisitId("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // FETCH BILL
  // ======================================================

  const handleFetchInvoice = async () => {
    if (!selectedVisitId) {
      alert("Please select visit");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/api/bills/fetchDetails/${selectedVisitId}/0`,
      );

      setBillData({
        medicineItems: res.data.medicineItems || [],
        labItems: res.data.labItems || [],
        physioItems: res.data.physioItems || [],
        opdItems: res.data.opdItems || [],
        additionalCharges:
          res.data.additionalCharges?.length > 0
            ? res.data.additionalCharges
            : additionalCharges,
        totalAmount: safeNumber(res.data.totalAmount),
        bedCharge: safeNumber(res.data.bedCharge),
        discount: safeNumber(res.data.discount),
        patientName: res.data.patientName || "",
        invoiceNumber: res.data.invoiceNumber || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // SAVE INVOICE
  // ======================================================

  const handleSaveInvoice = async () => {
    if (!selectedVisitId) {
      alert("Please select visit");
      return;
    }
    if (
      paymentMode === "SPLIT" &&
      Math.abs(splitPaymentTotal - grandTotalAmount) > 0.01
    ) {
      showNotification(
        `Split total (Rs. ${splitPaymentTotal.toFixed(2)}) must equal Net Payable (Rs. ${grandTotalAmount.toFixed(2)}).`,
        "warning",
      );
      return;
    }
    try {
      const res = await api.post("/api/bills/generate", {
        visitId: selectedVisitId, 
        bedId: 0,
        additionalCharges,
        discount: discount,
        paymentMode,
        cashAmount: paymentMode === "SPLIT" ? Number(splitPayment.cashAmount || 0) : 0,
        upiAmount: paymentMode === "SPLIT" ? Number(splitPayment.upiAmount || 0) : 0,
        cardAmount: paymentMode === "SPLIT" ? Number(splitPayment.cardAmount || 0) : 0,
      });

      setBillData({
        medicineItems: res.data.medicineItems || [],
        labItems: res.data.labItems || [],
        physioItems: res.data.physioItems || [],
        opdItems: res.data.opdItems || [],
        additionalCharges:
          res.data.additionalCharges?.length > 0
            ? res.data.additionalCharges
            : additionalCharges,
        totalAmount: safeNumber(res.data.totalAmount),
        bedCharge: safeNumber(res.data.bedCharge),
        subtotal: safeNumber(res.data.subtotal),
        discount: safeNumber(res.data.discount),
        patientName: res.data.patientName || "",
        invoiceNumber: res.data.invoiceNumber || "",
        paymentMode: res.data.paymentMode || "",
      });

      setIsSaved(true);

      setTimeout(() => {
      //  generatePDF();
      }, 300);

      showNotification("Invoice Saved Successfully", "success");
    } catch (err) {
      console.error(err);
    }
  };

  // ======================================================
  // PDF GENERATION
  // ======================================================

  const generatePDF = () => {
    try {
      const doc = new jsPDF();

      // ============================================
      // LOGO HEADER
      // ============================================

      const logoWidth = 140;
      const logoHeight = 32;

      const pageWidth = doc.internal.pageSize.getWidth();
      const x = (pageWidth - logoWidth) / 2;

      doc.addImage(hospitalLogo, "PNG", x, 8, logoWidth, logoHeight);

      // ============================================
      // ADDRESS
      // ============================================

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(80, 80, 80);

      doc.text(
        "Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209",
        105,
        44, // just below logo
        { align: "center" },
      );

      // ============================================
      // HEADER LINE
      // ============================================

      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.6);

      doc.line(11, 45, 199.5, 44.5);

      // ============================================
      // TITLE
      // ============================================

      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.setTextColor(30, 58, 138);

      doc.text("INVOICE BILL", 105, 57, {
        align: "center",
      });

      // Patient details
      let y = 72;

      doc.setFontSize(11);

      doc.setTextColor(0);

      // LEFT

      doc.setFont(undefined, "bold");

      doc.text("Patient Name", 15, y);

      doc.text(":", 52, y);

      doc.setFont(undefined, "normal");

      doc.text(selectedPatient?.name || "-", 58, y);

      // RIGHT

      doc.setFont(undefined, "bold");

      doc.text("Invoice No", 125, y);

      doc.text(":", 152, y);

      doc.setFont(undefined, "normal");

      doc.text(billData.invoiceNumber || "-", 158, y);

      // ============================================

      y += 10;

      doc.setFont(undefined, "bold");

      doc.text("PRN", 15, y);

      doc.text(":", 52, y);

      doc.setFont(undefined, "normal");

      doc.text(
        selectedPatient
          ? `PRN${String(selectedPatient.id).padStart(4, "0")}`
          : "-",
        58,
        y,
      );

      doc.setFont(undefined, "bold");

      doc.text("Visit No", 125, y);

      doc.text(":", 152, y);

      doc.setFont(undefined, "normal");

      doc.text(selectedVisit?.visitNumber || "-", 158, y);

      // ============================================

      y += 10;

      doc.setFont(undefined, "bold");

      doc.text("Mobile", 15, y);

      doc.text(":", 52, y);

      doc.setFont(undefined, "normal");

      doc.text(
        selectedPatient?.mobile ||
          selectedPatient?.mobileNumber ||
          selectedPatient?.phone ||
          selectedPatient?.phoneNumber ||
          "-",
        58,
        y,
      );

      doc.setFont(undefined, "bold");

      doc.text("Date", 125, y);

      doc.text(":", 152, y);

      doc.setFont(undefined, "normal");

      doc.text(new Date().toLocaleDateString("en-GB"), 158, y);

      // ============================================
      // DIVIDER
      // ============================================

      // y += 10;

      // doc.setDrawColor(180);

      // doc.line(10, y, 200, y);

      // ============================================
      // TABLE DATA
      // ============================================

      const tableBody = [];

      let serialNo = 1;

      // // ============================================
      // ============================================
      // BED CHARGES
      // ============================================

      if (billData.bedCharge > 0) {
        tableBody.push([
          {
            content: "BED CHARGES",
            colSpan: 5,
            styles: {
              fillColor: [254, 242, 242],
              textColor: [153, 27, 27],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        tableBody.push([
          serialNo++,
          "Bed Charges",
          "1",
          safeNumber(billData.bedCharge).toFixed(2),
          safeNumber(billData.bedCharge).toFixed(2),
        ]);
      }

      // ============================================
      // MEDICINES
      // ============================================

      if (billData.medicineItems?.length > 0) {
        tableBody.push([
          {
            content: "MEDICINES",
            colSpan: 5,
            styles: {
              fillColor: [220, 252, 231],
              textColor: [22, 101, 52],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        billData.medicineItems.forEach((m) => {
          tableBody.push([
            serialNo++,
            m.name,
            m.quantity,
            safeNumber(m.unitPrice).toFixed(2),
            safeNumber(m.subtotal).toFixed(2),
          ]);
        });
      }

      // ============================================
      // LAB TESTS
      // ============================================

      if (billData.labItems?.length > 0) {
        tableBody.push([
          {
            content: "LAB TESTS",
            colSpan: 5,
            styles: {
              fillColor: [254, 249, 195],
              textColor: [133, 77, 14],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        billData.labItems.forEach((l) => {
          tableBody.push([
            serialNo++,
            l.name,
            "1",
            safeNumber(l.subtotal).toFixed(2),
            safeNumber(l.subtotal).toFixed(2),
          ]);
        });
      }

      // ============================================
      // ADDITIONAL CHARGES
      // ============================================

      if (additionalCharges.length > 0) {
        tableBody.push([
          {
            content: "OTHER CHARGES",
            colSpan: 5,
            styles: {
              fillColor: [237, 233, 254],
              textColor: [91, 33, 182],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        additionalCharges.forEach((c) => {
          tableBody.push([
            serialNo++,
            c.chargeName,
            c.qty,
            safeNumber(c.amount).toFixed(2),
            safeNumber(c.amount).toFixed(2),
          ]);
        });
      }

      // ============================================
      // PHYSIO CHARGES
      // ============================================

      if (billData.physioItems.length > 0) {
        tableBody.push([
          {
            content: "PHYSIO CHARGES",
            colSpan: 5,
            styles: {
              fillColor: [232, 243, 244],
              textColor: [91, 33, 182],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        billData.physioItems.forEach((c) => {
          tableBody.push([
            serialNo++,
            c.name,
            "1",
            safeNumber(c.unitPrice).toFixed(2),
            safeNumber(c.subtotal).toFixed(2),
          ]);
        });
      }

      if (billData.opdItems?.length > 0) {
        tableBody.push([
          {
            content: "OPD CHARGES",
            colSpan: 5,
            styles: {
              fillColor: [245, 245, 245],
              textColor: [51, 51, 51],
              fontStyle: "bold",
              halign: "left",
            },
          },
        ]);

        billData.opdItems.forEach((o) => {
          tableBody.push([
            serialNo++,
            o.name,
            "1",
            safeNumber(o.unitPrice).toFixed(2),
            safeNumber(o.subtotal).toFixed(2),
          ]);
        });
      }

      // ============================================
      // TABLE
      // ============================================

      autoTable(doc, {
        startY: y + 8,

        head: [["SI No", "DESCRIPTION", "QTY", "PRICE", "SUBTOTAL"]],

        body: tableBody,

        theme: "grid",

        headStyles: {
          fillColor: [30, 58, 138],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
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
            cellWidth: 15, // SI No
            halign: "center",
          },

          1: {
            cellWidth: 85, // Description
          },

          2: {
            cellWidth: 20, // Qty
            halign: "center",
          },

          3: {
            cellWidth: 35, // Price
            halign: "right",
          },

          4: {
            cellWidth: 35, // Subtotal
            halign: "right",
          },
        },
      });

      // ============================================
      // GRAND TOTAL
      // ============================================

      const finalY = doc.lastAutoTable.finalY + 15;

      // Calculate subtotal before discount
      //   const grandTotal = subtotal - Number(discount || 0);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.setFont(undefined, "normal");

      // Right-aligned summary
      doc.text(`Subtotal : Rs. ${subtotalAmount.toFixed(2)}`, 195, finalY, {
        align: "right",
      });

      doc.text(
        `Discount : Rs. ${Number(discount || 0).toFixed(2)}`,
        195,
        finalY + 8,
        { align: "right" },
      );

      // Separator line
      doc.setDrawColor(180);
      doc.line(130, finalY + 12, 195, finalY + 12);

      // Grand Total
      doc.setFont(undefined, "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);

      doc.text(
        `Grand Total : Rs. ${grandTotalAmount.toFixed(2)}`,
        195,
        finalY + 22,
        { align: "right" },
      );
      // ============================================
      // FOOTER
      // ============================================

      doc.setFontSize(10);

      doc.setTextColor(100);

      doc.setFont(undefined, "normal");

      //  doc.text("Thank you for choosing Sri Sai Ram Hospital", 14, finalY + 20);

      // ============================================
      // SIGNATURE
      // ============================================

      const signY = finalY + 60;

      doc.line(140, signY, 190, signY);

      doc.setFont(undefined, "bold");

      doc.text("Authorized Signature", 148, signY + 8);

      // ============================================
      // SAVE
      // ============================================

      const invoiceNo = billData.invoiceNumber || "Invoice";

      doc.save(`${invoiceNo}.pdf`);
    } catch (error) {
      console.error(error);
      showNotification("Failed to generate invoice PDF", "error");
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#f8fafc",
        minHeight: "auto",
      }}
    >
      {/* ====================================================== */}
      {/* COMPACT SEARCH PANEL */}
      {/* ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,

          borderRadius: "20px",

          background: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",

          color: "#fff",

          boxShadow: "0 10px 30px rgba(30,64,175,0.20)",
        }}
      >
        {/* HEADER */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* SEARCH */}

          <TextField
            size="small"
            placeholder="Search PRN / Name ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePatientSearch()}
            sx={{
              width: 280,

              "& .MuiOutlinedInput-root": {
                height: 44,
                borderRadius: "14px",
                backgroundColor: "#fff",
              },

              "& input": {
                fontWeight: 600,
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{
                        color: "#64748b",
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* VISIT */}

          <FormControl
            size="small"
            sx={{
              width: 180,
            }}
          >
            <Select
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
              displayEmpty
              sx={{
                height: 44,

                borderRadius: "14px",

                backgroundColor: "#fff",

                fontWeight: 600,
              }}
            >
              <MenuItem value="">Select Visit</MenuItem>

              {visits.map((visit) => (
                <MenuItem key={visit.id} value={visit.id}>
                  {visit.visitNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* BUTTON */}

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleFetchInvoice}
            disabled={loading}
            sx={{
              minWidth: 190,
              height: 50,

              borderRadius: "14px",

              textTransform: "none",

              fontSize: "0.95rem",
              fontWeight: 700,

              background: "linear-gradient(135deg,#10B981,#059669)",

              boxShadow: "0 8px 24px rgba(16,185,129,0.25)",

              "&:hover": {
                background: "linear-gradient(135deg,#059669,#047857)",

                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? "Loading..." : "Fetch Invoice"}
          </Button>
        </Box>

        {/* PATIENT DETAILS */}

        <Box
          sx={{
            mt: 3,

            display: "flex",
            flexWrap: "wrap",

            gap: 2,

            p: 2,

            borderRadius: "16px",

            background: "rgba(255,255,255,0.15)",

            backdropFilter: "blur(10px)",

            border: "1px solid rgba(255,255,255,0.20)",
          }}
        >
          <Typography variant="body2">
            <strong>Name:</strong>{" "}
            <strong>{selectedPatient?.name || "-"}</strong>
          </Typography>

          <Typography variant="body2">
            <strong>PRN:</strong>{" "}
            <strong>
              {selectedPatient
                ? `PRN${String(selectedPatient.id).padStart(4, "0")}`
                : "-"}
            </strong>
          </Typography>

          <Typography variant="body2">
            <strong>Visit:</strong>
            <strong> {selectedVisit?.visitNumber || "-"}</strong>
          </Typography>

          <Typography variant="body2">
            <strong>Mobile:</strong>{" "}
            {selectedPatient?.phone || selectedPatient?.mobile || "-"}
          </Typography>

          <Typography variant="body2">
            <strong>Date:</strong>{" "}
            {selectedVisit?.visitDate
              ? new Date(selectedVisit.visitDate).toLocaleDateString("en-IN")
              : "-"}
          </Typography>

          <Typography variant="body2">
            <strong>Invoice:</strong> {billData.invoiceNumber || "-"}
          </Typography>
        </Box>
      </Paper>

      {/* ====================================================== */}
      {/* BILL PREVIEW */}
      {/* ====================================================== */}

      <Card
        sx={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1e3a8a",
              }}
            >
              Invoice Preview
            </Typography>

            <Chip
              label={billData.invoiceNumber || "Draft"}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 3,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Autocomplete
              size="small"
              sx={{
                minWidth: 350,
                flex: 1,
              }}
              options={availableCharges}
              value={
                availableCharges.find((c) => c.configKey === selectedCharge) ||
                null
              }
              onChange={(event, newValue) => {
                setSelectedCharge(newValue ? newValue.configKey : "");
              }}
              getOptionLabel={(option) =>
                `${option.configKey.replaceAll("_", " ")}`
              }
              isOptionEqualToValue={(option, value) =>
                option.configKey === value.configKey
              }
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{option.configKey.replaceAll("_", " ")}</span>-{" "}
                  <strong>₹{option.configValue}</strong>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Additional Charges"
                  placeholder="Type Charge Name"
                />
              )}
            />

            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleAddCharge}
              sx={{
                minWidth: 170,
                height: 50,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #0891B2)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Add Charge
            </Button>
          </Box>

          <TableContainer>
            <Table
              sx={{
                tableLayout: "fixed",
                width: "100%",
              }}
            >
              {/* ========================================= */}
              {/* TABLE HEADER */}
              {/* ========================================= */}

              <TableHead
                sx={{
                  backgroundColor: "#f1f5f9",
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      width: "45%",
                    }}
                  >
                    Description
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      width: "15%",
                    }}
                  >
                    Qty
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      width: "20%",
                    }}
                  >
                    Price
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      width: "20%",
                    }}
                  >
                    Subtotal
                  </TableCell>
                </TableRow>
              </TableHead>

              {/* ========================================= */}
              {/* TABLE BODY */}
              {/* ========================================= */}

              <TableBody>
                {/* ========================================= */}
                {/* BED CHARGES */}
                {/* ========================================= */}

                {billData.bedCharge > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#fee2e2",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#78a8b9",
                          fontSize: "14px",
                          borderBottom: "none",
                        }}
                      >
                        BED CHARGES
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>Bed Charges</TableCell>

                      <TableCell align="center">1</TableCell>

                      <TableCell align="right">
                        ₹{safeNumber(billData.bedCharge).toFixed(2)}
                      </TableCell>

                      <TableCell align="right">
                        ₹{safeNumber(billData.bedCharge).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </>
                )}

                {/* ========================================= */}
                {/* Additional Charges */}
                {/* ========================================= */}

                {additionalCharges.length > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#ede9fe",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#5b21b6",
                        }}
                      >
                        OTHER CHARGES
                      </TableCell>
                    </TableRow>

                    {additionalCharges.map((item) => (
                      <TableRow key={item.configKey}>
                        <TableCell>{item.chargeName}</TableCell>

                        <TableCell align="center">{item.qty}</TableCell>

                        <TableCell align="right">
                          ₹{item.amount.toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            ₹{item.amount.toFixed(2)}
                            <Tooltip title="Remove Charge">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() =>
                                  handleRemoveCharge(item.configKey)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* ========================================= */}
                {/* MEDICINES */}
                {/* ========================================= */}

                {billData.medicineItems?.length > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#dcfce7",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#166534",
                          fontSize: "14px",
                          borderBottom: "none",
                        }}
                      >
                        MEDICINES
                      </TableCell>
                    </TableRow>

                    {billData.medicineItems.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell>{m.name}</TableCell>

                        <TableCell align="center">{m.quantity}</TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(m.unitPrice).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(m.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* ========================================= */}
                {/* LAB TESTS */}
                {/* ========================================= */}

                {billData.labItems?.length > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#fef9c3",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#854d0e",
                          fontSize: "14px",
                          borderBottom: "none",
                        }}
                      >
                        LAB TESTS
                      </TableCell>
                    </TableRow>

                    {billData.labItems.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell>{l.name}</TableCell>

                        <TableCell align="center">1</TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(l.subtotal).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(l.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* ========================================= */}
                {/* PHYSIOTHERAPY */}
                {/* ========================================= */}

                {billData.physioItems?.length > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#dbeafe",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#1d4ed8",
                          fontSize: "14px",
                          borderBottom: "none",
                        }}
                      >
                        PHYSIOTHERAPY CHARGES
                      </TableCell>
                    </TableRow>

                    {billData.physioItems.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>{p.name}</TableCell>

                        <TableCell align="center">{p.quantity}</TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(p.unitPrice).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(p.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {billData.opdItems?.length > 0 && (
                  <>
                    <TableRow
                      sx={{
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <TableCell
                        colSpan={4}
                        sx={{
                          fontWeight: "bold",
                          color: "#333333",
                          fontSize: "14px",
                          borderBottom: "none",
                        }}
                      >
                        OPD CHARGES
                      </TableCell>
                    </TableRow>

                    {billData.opdItems.map((o, i) => (
                      <TableRow key={i}>
                        <TableCell>{o.name}</TableCell>

                        <TableCell align="center">1</TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(o.unitPrice).toFixed(2)}
                        </TableCell>

                        <TableCell align="right">
                          ₹{safeNumber(o.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}

                {/* ========================================= */}
                {/* GRAND TOTAL */}
                {/* ========================================= */}

                <TableRow>
                  <TableCell colSpan={3}>Subtotal</TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#1e3a8a",
                      fontSize: "18px",
                    }}
                  >
                    ₹{subtotalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>

                <TableRow
                  sx={{
                    backgroundColor: "#fefce8",
                  }}
                >
                  <TableCell colSpan={3}>Discount</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                </TableRow>

                <TableRow
                  sx={{
                    backgroundColor: "#fefce8",
                  }}
                >
                  <TableCell colSpan={3}>Payment Mode</TableCell>
                <TableCell align="right">
                  <TextField
                    select
                    fullWidth
                    label="Payment Mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CARD">Card</MenuItem>
                    <MenuItem value="SPLIT">Split Payment</MenuItem>
                    <MenuItem value="INSURANCE">Insurance</MenuItem>
                  </TextField>
                </TableCell>
                </TableRow>

                {paymentMode === "SPLIT" && (
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell colSpan={4}>
                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <TextField
                          size="small"
                          type="number"
                          label="Cash Amount"
                          value={splitPayment.cashAmount}
                          onChange={(e) =>
                            setSplitPayment({ ...splitPayment, cashAmount: e.target.value })
                          }
                          inputProps={{ min: 0 }}
                          sx={{ flex: 1, minWidth: 150 }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="UPI Amount"
                          value={splitPayment.upiAmount}
                          onChange={(e) =>
                            setSplitPayment({ ...splitPayment, upiAmount: e.target.value })
                          }
                          inputProps={{ min: 0 }}
                          sx={{ flex: 1, minWidth: 150 }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Card Amount"
                          value={splitPayment.cardAmount}
                          onChange={(e) =>
                            setSplitPayment({ ...splitPayment, cardAmount: e.target.value })
                          }
                          inputProps={{ min: 0 }}
                          sx={{ flex: 1, minWidth: 150 }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          mt: 1,
                          color:
                            Math.abs(splitPaymentTotal - grandTotalAmount) <= 0.01
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        Split total: ₹{splitPaymentTotal.toFixed(2)} / ₹
                        {grandTotalAmount.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                <TableRow sx={{ backgroundColor: "#e0f2fe" }}>
                  <TableCell colSpan={3} sx={{ fontWeight: "bold" }}>
                    Net Payable
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#1e3a8a",
                      fontSize: "18px",
                    }}
                  >
                    ₹{grandTotalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* ACTIONS */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSaveInvoice}
              disabled={isSaved}
              sx={{
                minWidth: 180,
                height: 50,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,

                background: isSaved
                  ? "#CBD5E1"
                  : "linear-gradient(135deg, #10B981, #059669)",

                color: isSaved ? "#64748B" : "#fff",

                boxShadow: isSaved
                  ? "none"
                  : "0 8px 24px rgba(16,185,129,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: isSaved
                    ? "#CBD5E1"
                    : "linear-gradient(135deg, #059669, #047857)",

                  transform: isSaved ? "none" : "translateY(-2px)",

                  boxShadow: isSaved
                    ? "none"
                    : "0 12px 28px rgba(16,185,129,0.35)",
                },

                "&:disabled": {
                  background: "#E2E8F0",
                  color: "#94A3B8",
                },
              }}
            >
              {isSaved ? "Invoice Saved" : "Save Invoice"}
            </Button>

            <Button
              variant="contained"
              startIcon={<ReceiptIcon />}
              onClick={generatePDF}
              sx={{
                minWidth: 180,
                height: 50,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,

                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                color: "#fff",

                boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #0891B2)",

                  transform: "translateY(-2px)",

                  boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Generate PDF
            </Button>

            {/* HISTORY BUTTON */}
            {/* <Button
              variant="contained" // Changed to contained for solid background
              startIcon={<HistoryIcon />}
              onClick={() => navigate("/invoice-history")}
              sx={{
                backgroundColor: "#2563eb", // Matching PDF button blue
                borderRadius: "10px", // Matching PDF button radius
                textTransform: "none",
                fontWeight: 600, // Standard weight for contained buttons
                px: 3,
                "&:hover": {
                  backgroundColor: "#1d4ed8", // Slightly darker blue on hover
                },
              }}
            >
              Invoice History
            </Button> */}
          </Box>
        </CardContent>
      </Card>

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
