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
  IconButton,
  TablePagination,
  Grid,
  Autocomplete,
  Divider,
  Chip,
  Collapse,
} from "@mui/material";
import api from "../services/api";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PaymentsIcon from "@mui/icons-material/Payments";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import QrCodeIcon from "@mui/icons-material/QrCode";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { getPatients } from "../api/patientApi";
import { getLabTests, createLabTest, deleteLabTest } from "../api/labTestApi";
import { formatDateTime } from "../utils/dateFormatter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LabTests() {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [configList, setConfigList] = useState([]);

  const [showSummary, setShowSummary] = useState(false);

  // Form States
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [visitNumber, setVisitNumber] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [splitPayment, setSplitPayment] = useState({
    cashAmount: "",
    upiAmount: "",
    cardAmount: "",
  });

  const upiId = import.meta.env.VITE_UPI_ID || "8553839908@upi";
  const upiName = import.meta.env.VITE_UPI_NAME || "Madhav Hospital";

  useEffect(() => {
    loadPatients();
    loadTests();
    loadConfigs();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTests = async () => {
    try {
      const res = await getLabTests();
      const sortedTests = (res.data || []).sort(
        (a, b) => Number(b.id) - Number(a.id),
      );
      setTests(sortedTests);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConfigs = async () => {
    try {
      const res = await api.get("/api/configs/category/LAB");

      setConfigList(res.data);
    } catch (err) {
      console.error("Error loading configs:", err);
    }
  };

  const handlePatientChange = async (value) => {
    if (!value) return;
    setPatientId(value);

    const currentPatient = patients.find((p) => String(p.id) === String(value));
    const capturedName = currentPatient ? currentPatient.name : "";
    setPatientName(capturedName);

    try {
      const response = await api.get(`/api/visits/active/${value}`);
      const activeVisits = response.data || [];
      setVisits(activeVisits);

      if (activeVisits.length > 0) {
        setSelectedVisitId(activeVisits[0].id);
        setVisitNumber(activeVisits[0].visitNumber);
      } else {
        setSelectedVisitId("");
        setVisitNumber("");
      }
    } catch (error) {
      console.error("Failed to load visits", error);
      setVisits([]);
      setSelectedVisitId("");
      setVisitNumber("");
    }
  };

  const handleTestChange = (selectedKey) => {
    setTestName(selectedKey);
    const selectedConfig = configList.find((c) => c.configKey === selectedKey);
    setAmount(selectedConfig ? selectedConfig.configValue : 0);
  };

  const handleSubmit = async () => {
    let finalPatientName = patientName;
    if (!finalPatientName && patientId) {
      const p = patients.find((item) => String(item.id) === String(patientId));
      if (p) finalPatientName = p.name;
    }

    if (!patientId || !testName || !testDate || !finalPatientName) {
      alert("Please fill all fields, including Patient selection.");
      return;
    }

    const splitPaymentTotal = Object.values(splitPayment).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
    if (
      paymentMode === "SPLIT" &&
      Math.abs(splitPaymentTotal - Number(amount || 0)) > 0.01
    ) {
      alert("Split payment total must equal the lab test amount.");
      return;
    }
    const payload = {
      patientId: Number(patientId),
      visitId: selectedVisitId ? Number(selectedVisitId) : null,
      visitNumber: visitNumber || "N/A",
      patientName: finalPatientName,
      testName: testName.replace(/_/g, " "),
      amount: Number(amount || 0),
      result: result ? result.toUpperCase() : "PENDING",
      testDate: testDate,
      paymentMode: paymentMode,
      cashAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.cashAmount || 0) : 0,
      upiAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.upiAmount || 0) : 0,
      cardAmount:
        paymentMode === "SPLIT" ? Number(splitPayment.cardAmount || 0) : 0,
      billed: paymentMode !== "PAY_LATER",
    };

    try {
      await createLabTest(payload);
      alert("Lab test record added successfully!");
      resetForm();
      loadTests();
    } catch (err) {
      console.error(err);
      alert("Error saving record: " + (err.response?.data || err.message));
    }
  };

  const resetForm = () => {
    setPatientId("");
    setPatientName("");
    setTestName("");
    setAmount("");
    setResult("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setSelectedVisitId("");
    setVisitNumber("");
    setVisits([]);
    setPaymentMode("CASH");
    setSplitPayment({ cashAmount: "", upiAmount: "", cardAmount: "" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this test record?")) {
      try {
        await deleteLabTest(id);
        loadTests();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePrintLabTest = (test) => {
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

      doc.text("LAB TEST RECEIPT", 105, 66, {
        align: "center",
      });

      let y = 82;

      // =====================================
      // PATIENT DETAILS
      // =====================================

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      doc.setFont(undefined, "bold");
      doc.text("Patient Name", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(test.patientName || "-", 60, y);

      doc.setFont(undefined, "bold");
      doc.text("Test Name", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(test.testName || "-", 160, y);

      y += 10;

      doc.setFont(undefined, "bold");
      doc.text("PRN", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(`PRN${String(test.patientId).padStart(4, "0")}`, 60, y);

      doc.setFont(undefined, "bold");
      doc.text("Result", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(test.result || "PENDING", 160, y);

      y += 10;

      doc.setFont(undefined, "bold");
      doc.text("Visit No", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(test.visitNumber || "-", 60, y);

      doc.setFont(undefined, "bold");
      doc.text("Date", 125, y);
      doc.text(":", 155, y);

      doc.setFont(undefined, "normal");
      doc.text(formatDateTime(test.testDate), 160, y);

      y += 10;

      doc.setFont(undefined, "bold");
      doc.text("Payment Mode", 15, y);
      doc.text(":", 55, y);

      doc.setFont(undefined, "normal");
      doc.text(
        test.paymentMode === "PAY_LATER"
          ? "PAY LATER"
          : test.paymentMode || "CASH",
        60,
        y,
      );

      // =====================================
      // CHARGES TABLE
      // =====================================

      autoTable(doc, {
        startY: y + 15,

        head: [["#", "DESCRIPTION", "AMOUNT (₹)"]],

        body: [
          [1, test.testName || "Lab Test", Number(test.amount || 0).toFixed(2)],
        ],

        foot: [["", "TOTAL", Number(test.amount || 0).toFixed(2)]],

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

      doc.save(`LabTest_${test.patientName || "Patient"}_${test.id}.pdf`);
    };

    img.onerror = () => {
      // Fallback if logo fails to load
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138);
      doc.setFont(undefined, "bold");
      doc.text("MADHAV HOSPITAL", 105, 20, { align: "center" });

      doc.setDrawColor(30, 58, 138);
      doc.line(10, 25, 200, 25);

      doc.setFontSize(16);
      doc.text("LAB TEST RECEIPT", 105, 38, { align: "center" });

      let y = 55;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      const fallbackDraw = (label, value, xLabel, xColon, xValue) => {
        doc.setFont(undefined, "bold");
        doc.text(label, xLabel, y);
        doc.text(":", xColon, y);
        doc.setFont(undefined, "normal");
        doc.text(String(value), xValue, y);
        y += 10;
      };

      fallbackDraw("Patient Name", test.patientName || "-", 15, 55, 60);
      fallbackDraw(
        "PRN",
        `PRN${String(test.patientId).padStart(4, "0")}`,
        15,
        55,
        60,
      );
      fallbackDraw("Visit No", test.visitNumber || "-", 15, 55, 60);
      fallbackDraw("Test Name", test.testName || "-", 15, 55, 60);
      fallbackDraw("Result", test.result || "PENDING", 15, 55, 60);
      fallbackDraw("Date", formatDateTime(test.testDate), 15, 55, 60);
      fallbackDraw(
        "Payment Mode",
        test.paymentMode === "PAY_LATER"
          ? "PAY LATER"
          : test.paymentMode || "CASH",
        15,
        55,
        60,
      );

      autoTable(doc, {
        startY: y + 10,
        head: [["#", "DESCRIPTION", "AMOUNT (₹)"]],
        body: [
          [1, test.testName || "Lab Test", Number(test.amount || 0).toFixed(2)],
        ],
        foot: [["", "TOTAL", Number(test.amount || 0).toFixed(2)]],
        theme: "grid",
        headStyles: { fillColor: [30, 58, 138] },
        footStyles: {
          fillColor: [220, 220, 220],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
      });

      const finalY = doc.lastAutoTable.finalY + 30;
      doc.line(130, finalY, 190, finalY);
      doc.setFont(undefined, "bold");
      doc.text("Authorized Signature", 140, finalY + 10);

      doc.save(`LabTest_${test.patientName || "Patient"}_${test.id}.pdf`);
    };
  };

  const filteredTests = tests.filter((t) => {
    const pName = t.patientName?.toLowerCase() || "";
    const prn = `prn${String(t.patientId).padStart(4, "0")}`;
    const tName = t.testName?.toLowerCase() || "";
    return (
      pName.includes(search.toLowerCase()) ||
      prn.includes(search.toLowerCase()) ||
      tName.includes(search.toLowerCase())
    );
  });

  // Calculate today's totals
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTests = tests.filter((t) => {
    if (!t.testDate) return false;
    return t.testDate.startsWith(todayStr);
  });
  const todayTotal = todayTests.reduce((sum, t) => sum + (t.amount || 0), 0);
  const todayCash = todayTests
    .filter((t) => t.paymentMode === "CASH")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const todayUpi = todayTests
    .filter((t) => t.paymentMode === "UPI")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Box
      sx={{ padding: "10px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
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
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(30,58,138,0.08)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S LAB BILL TOTAL
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ₹{todayTotal.toFixed(2)}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(13,148,136,0.08)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S CASH TOTAL
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ₹{todayCash.toFixed(2)}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              flex: 1,
              minWidth: "150px",
              background: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
              color: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(245,158,11,0.08)",
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, fontWeight: 700, display: "block" }}
            >
              TODAY'S UPI TOTAL
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              ₹{todayUpi.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
      </Collapse>

      {/* PERFECTLY ALIGNED FORM GRID */}
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
          {/* PATIENT */}

          <FormControl fullWidth sx={{ flex: 1, minWidth: "250px" }}>
            <Autocomplete
              fullWidth
              autoHighlight
              options={patients}
              getOptionLabel={(option) =>
                `${option.patientCode || `PRN${String(option.id).padStart(4, "0")}`} - ${option.name || ""}`
              }
              value={
                patients.find((p) => String(p.id) === String(patientId)) || null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  handlePatientChange(newValue.id);
                } else {
                  setPatientId("");
                  setPatientName("");
                  setVisits([]);
                  setSelectedVisitId("");
                  setVisitNumber("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type PRN / Name"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </FormControl>

          {/* VISIT */}

          <FormControl fullWidth sx={{ flex: 1, minWidth: "220px" }}>
            <Autocomplete
              fullWidth
              autoHighlight
              options={visits}
              getOptionLabel={(option) => option.visitNumber || ""}
              value={
                visits.find((v) => String(v.id) === String(selectedVisitId)) ||
                null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  setSelectedVisitId(newValue.id);
                  setVisitNumber(newValue.visitNumber);
                } else {
                  setSelectedVisitId("");
                  setVisitNumber("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Visit"
                  placeholder="Type Visit Number"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={visits.length === 0}
            />
          </FormControl>

          {/* DYNAMIC DROPDOWN FROM CONFIGS */}
          <FormControl sx={{ flex: 1, minWidth: "220px" }}>
            <InputLabel>Test Name</InputLabel>
            <Select
              value={testName}
              label="Test Name"
              onChange={(e) => handleTestChange(e.target.value)}
            >
              {configList.map((config) => (
                <MenuItem key={config.configKey} value={config.configKey}>
                  {config.configKey.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount (₹)"
            value={amount}
            disabled
            sx={{
              flex: 0.5,
              minWidth: "120px",
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#1e3a8a",
                fontWeight: "bold",
              },
            }}
          />

          <TextField
            label="Result / Findings"
            placeholder="e.g. Normal"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <TextField
            type="datetime-local"
            label="Test Date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
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

          {/* PAYMENT MODE */}
          <FormControl sx={{ flex: 1, minWidth: "160px" }}>
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
          {paymentMode === "SPLIT" && (
            <Box sx={{ display: "flex", gap: 1, flex: 2, flexWrap: "wrap" }}>
              <TextField
                size="small"
                type="number"
                label="Cash"
                value={splitPayment.cashAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    cashAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
                sx={{ flex: 1, minWidth: 110 }}
              />
              <TextField
                size="small"
                type="number"
                label="UPI"
                value={splitPayment.upiAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    upiAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
                sx={{ flex: 1, minWidth: 110 }}
              />
              <TextField
                size="small"
                type="number"
                label="Card"
                value={splitPayment.cardAmount}
                onChange={(e) =>
                  setSplitPayment({
                    ...splitPayment,
                    cardAmount: e.target.value,
                  })
                }
                inputProps={{ min: 0 }}
                sx={{ flex: 1, minWidth: 110 }}
              />
            </Box>
          )}
        </Box>

        {/* Dynamic Payment Details Panel */}
        {amount > 0 && (
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
            {/* Amount Breakdown/Estimation */}
            <Box sx={{ minWidth: "200px" }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  fontWeight: "800",
                  mb: 0.5,
                  letterSpacing: "0.5px",
                }}
              >
                LAB TEST TARIFF
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.5,
                  width: "100%",
                  maxWidth: "250px",
                }}
              >
                <Typography sx={{ color: "text.primary", fontSize: "0.9rem" }}>
                  {testName.replace(/_/g, " ")}
                </Typography>
                <Typography sx={{ fontWeight: "700", fontSize: "0.9rem" }}>
                  ₹{Number(amount).toFixed(2)}
                </Typography>
              </Box>
              <Divider
                sx={{
                  my: 1,
                  borderColor: "rgba(0,0,0,0.06)",
                  maxWidth: "250px",
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.5,
                  width: "100%",
                  maxWidth: "250px",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "850",
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
                  ₹{Number(amount).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Dynamic details based on paymentMode */}
            {paymentMode === "UPI" && (
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
                    `upi://pay?pa=${upiId}&pn=${upiName}&am=${amount}&cu=INR&tn=LabTest_${testName}`,
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
                    Scan to pay Lab Test charges securely.
                  </Typography>
                  <Chip
                    label={`₹${Number(amount).toFixed(2)}`}
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

            {paymentMode === "CASH" && (
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
                    label={`Collect: ₹${Number(amount).toFixed(2)}`}
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

            {paymentMode === "CARD" && (
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
                    label={`Swipe: ₹${Number(amount).toFixed(2)}`}
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

            {paymentMode === "PAY_LATER" && (
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
                    label={`Pay Later: ₹${Number(amount).toFixed(2)}`}
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
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<AddCircleIcon />}
            sx={{
              height: 50,
              px: 4,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10B981, #059669)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
              },
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Save Record
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* SEARCH BAR */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by Patient Name or PRN..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      {/* TABLE DATA GRID */}
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
                SI No
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 1.5 }}>
                PRN
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PATIENT NAME
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                VISIT NO
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                TEST
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                TARIFF
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PAY MODE
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                RESULT
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                DATE
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
              >
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report, index) => (
                <TableRow key={report.id} hover>
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                    PRN{String(report.patientId).padStart(4, "0")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {report.patientName || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0284c7" }}>
                    {report.visitNumber}
                  </TableCell>
                  <TableCell>{report.testName}</TableCell>
                  <TableCell>₹{report.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        report.paymentMode === "PAY_LATER"
                          ? "PAY LATER"
                          : report.paymentMode || "CASH"
                      }
                      size="small"
                      color={
                        report.paymentMode === "UPI"
                          ? "info"
                          : report.paymentMode === "CARD"
                            ? "primary"
                            : report.paymentMode === "PAY_LATER"
                              ? "default"
                              : "success"
                      }
                      variant="outlined"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        height: "20px",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor:
                          report.result === "NORMAL" ? "#e8f5e9" : "#fff3e0",
                        color:
                          report.result === "NORMAL" ? "#2e7d32" : "#b78103",
                        px: 1,
                        py: 0.25,
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                      }}
                    >
                      {report.result || "PENDING"}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(report.testDate)}</TableCell>
                  <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handlePrintLabTest(report)}
                      title="Print Receipt"
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(report.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
}
