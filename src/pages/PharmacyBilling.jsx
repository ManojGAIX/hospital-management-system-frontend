import React, { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Autocomplete,
  InputAdornment,
  Grid,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptIcon from "@mui/icons-material/Receipt";

import api from "../services/api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { savePharmacyBill } from "../api/pharmacyApi";
import { formatDate } from "../utils/dateFormatter";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function PharmacyBilling() {
  // ============================================
  // STATES
  // ============================================

  const [patients, setPatients] = useState([]);

  const [medicines, setMedicines] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [latestVisit, setLatestVisit] = useState(null);

  const [cart, setCart] = useState([]);

  const [selectedMedicineId, setSelectedMedicineId] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [discount, setDiscount] = useState(0);

  const gstPercent = 5;

  const [paymentMode, setPaymentMode] = useState("CASH");

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

  // ============================================
  // LOAD INITIAL DATA
  // ============================================

  useEffect(() => {
    loadPatients();
    loadMedicines();
  }, []);

  // ============================================
  // LOAD PATIENTS
  // ============================================

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/patients");

      setPatients(res.data);
    } catch (err) {
      console.error("Patients Load Error", err);
    }
  };

  // ============================================
  // LOAD MEDICINES
  // ============================================

  const loadMedicines = async () => {
    try {
      const res = await api.get("/api/medicines");

      setMedicines(res.data);
    } catch (err) {
      console.error("Medicine Load Error", err);
    }
  };

  // ============================================
  // SEARCH PATIENT
  // PRN / NAME / MOBILE
  // ============================================

  const handleSearchPatient = async () => {
    try {
      const patient = patients.find(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.includes(search) ||
          p.patientCode?.toLowerCase().includes(search.toLowerCase()),
      );

      if (!patient) {
        alert("Patient not found");
        return;
      }

      setSelectedPatient(patient);

      // ==========================================
      // GET ACTIVE VISIT
      // ==========================================

      const visitRes = await api.get(`/api/visits/active/${patient.id}`,
      );

      if (!visitRes.data || visitRes.data.length === 0) {
        alert("No active visit found");
        return;
      }

      const activeVisit = visitRes.data[0];

      setLatestVisit(activeVisit);

      // ==========================================
      // LOAD PRESCRIPTIONS
      // ==========================================

      const prescriptionRes = await api.get(`/api/prescriptions/visit/${activeVisit.id}`,
      );

      const prescriptionCart = prescriptionRes.data.map((p) => {
        const medicineMaster = medicines.find(
          (m) => m.id === p.medicineId || m.medicineName === p.medicineName,
        );

        const unitPrice = medicineMaster?.price || 0;

        const batchNo = medicineMaster?.batchNo || "";

        const expiryDate = medicineMaster?.expiryDate || "";

        // ======================================
        // DOSAGE TO QUANTITY
        // Example 1-0-1 for 5 days
        // ======================================

        let dailyQty = 1;

        try {
          if (p.dosage?.includes("-")) {
            const parts = p.dosage.split("-");

            dailyQty = Number(parts[0]) + Number(parts[1]) + Number(parts[2]);
          }
        } catch {
          dailyQty = 1;
        }

        const finalQty = dailyQty * (p.days || 1);

        return {
          medicineId: medicineMaster?.id || p.medicineId,

          medicineName: p.medicineName,

          batchNo,

          expiryDate,

          quantity: finalQty,

          availableStock: medicineMaster?.stockQuantity || 0,

          unitPrice,

          gstPercent: 5,

          subtotal: unitPrice * finalQty,
        };
      });

      setCart(prescriptionCart);
    } catch (err) {
      console.error(err);

      showNotification("Failed to load patient data", "error");
    }
  };

  // ============================================
  // CALCULATIONS
  // ============================================

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const gstAmount = cart.reduce(
    (sum, item) =>
      sum + (item.quantity * item.unitPrice * item.gstPercent) / 100,
    0,
  );

  const finalAmount = subtotal - Number(discount || 0);

  // ============================================
  // FORMAT EXPIRY
  // ============================================

  const formatExpiryDate = (date) => {
    if (!date) return "-";

    return new Date(date)
      .toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  // ============================================
  // ADD MEDICINE TO CART
  // ============================================

  const handleAddMedicine = () => {
    const medicine = medicines.find(
      (m) => String(m.id) === String(selectedMedicineId),
    );

    if (!medicine) {
      showNotification("Select Medicine", "warning");
      return;
    }

    if (quantity <= 0) {
      showNotification("Invalid Quantity", "warning");
      return;
    }

    // ========================================
    // STOCK VALIDATION
    // ========================================

    if (medicine.stockQuantity < quantity) {
      alert(`Only ${medicine.stockQuantity} stock available`);
      return;
    }

    const subtotal = medicine.price * quantity;

    // ========================================
    // CHECK DUPLICATE
    // ========================================

    const existingIndex = cart.findIndex((c) => c.medicineId === medicine.id);

    if (existingIndex >= 0) {
      const updatedCart = [...cart];

      updatedCart[existingIndex].quantity += quantity;

      updatedCart[existingIndex].subtotal =
        updatedCart[existingIndex].quantity *
        updatedCart[existingIndex].unitPrice;

      setCart(updatedCart);
    } else {
      const item = {
        medicineId: medicine.id,

        medicineName: medicine.medicineName,

        batchNo: medicine.batchNo || "",

        expiryDate: medicine.expiryDate || "",

        availableStock: medicine.stockQuantity || 0,

        quantity,

        unitPrice: medicine.price || 0,

        gstPercent: 5,

        subtotal,
      };

      setCart([...cart, item]);
    }

    // ========================================
    // RESET CONTROLS
    // ========================================

    setSelectedMedicineId("");

    setQuantity(1);
  };

  // ============================================
  // REMOVE MEDICINE
  // ============================================

  const removeItem = (index) => {
    const updatedCart = [...cart];

    updatedCart.splice(index, 1);

    setCart(updatedCart);
  };

  // ============================================
  // UPDATE QUANTITY
  // EDITABLE QTY FIELD
  // ============================================

  const handleQuantityChange = (index, value) => {
    const qty = Math.max(1, Number(value)) || 1;

    const updatedCart = [...cart];

    const item = updatedCart[index];

    // ========================================
    // STOCK VALIDATION
    // ========================================

    if (item.availableStock && qty > item.availableStock) {
      alert(`Only ${item.availableStock} stock available`);

      return;
    }

    updatedCart[index] = {
      ...item,

      quantity: qty,

      subtotal: qty * item.unitPrice,
    };

    setCart(updatedCart);
  };

  // ============================================
  // UPDATE DISCOUNT
  // ============================================

  const handleDiscountChange = (event) => {
    const value = Number(event.target.value) || 0;

    setDiscount(value);
  };

  // ============================================
  // CLEAR BILL
  // ============================================

  const clearBill = () => {
    setSearch("");

    setSelectedPatient(null);

    setLatestVisit(null);

    setSelectedMedicineId("");

    setQuantity(1);

    setDiscount(0);

    setCart([]);
  };

  // ============================================
  // LOAD EXISTING PHARMACY BILL
  // Example:
  // /api/pharmacy/1
  // ============================================

  const loadPharmacyInvoice = async (id) => {
    try {
      const res = await api.get(
        `/api/pharmacy/${id}`,
      );

      const invoice = res.data.invoice;

      const items = res.data.items || [];

      setCart(
        items.map((item) => ({
          medicineId: item.medicineId,

          medicineName: item.medicineName,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          gstPercent: item.gstPercent,

          subtotal: item.subtotal,

          batchNo: item.batchNo,

          expiryDate: item.expiryDate,

          availableStock: 0,
        })),
      );

      setDiscount(invoice.discount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================
  // TABLE TOTALS
  // ============================================

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalMedicineTypes = cart.length;

  // ============================================
  // LOW STOCK CHECK
  // ============================================

  const isLowStock = (stock) => {
    return stock <= 10;
  };

  // ============================================
  // SAVE BILL
  // ============================================

  const handleSave = async () => {
    try {
      if (!selectedPatient) {
        showNotification("Search patient first", "warning");
        return;
      }

      if (cart.length === 0) {
        showNotification("Add medicines", "warning");
        return;
      }

      const payload = {
        patientId: selectedPatient.id,

        visitId: latestVisit?.id,

        patientName: selectedPatient.name,

        mobile: selectedPatient.phone,

        subtotal,

        discount,

        gstAmount,

        finalAmount,

        paymentMode,

        items: cart.map((item) => ({
          medicineId: item.medicineId,

          medicineName: item.medicineName,

          quantity: item.quantity,

          unitPrice: item.unitPrice,

          gstPercent: item.gstPercent,

          subtotal: item.quantity * item.unitPrice,

          batchNo: item.batchNo,

          expiryDate: item.expiryDate,
        })),
      };

      console.log("PHARMACY SAVE PAYLOAD", payload);

      const response = await savePharmacyBill(payload);

      console.log("SAVE RESPONSE", response.data);

      generatePDF(response.data);
      showNotification("Pharmacy Bill Saved Successfully", "success");

      clearBill();
    } catch (err) {
      console.error(err);
      showNotification("Failed to save pharmacy bill", "error");
    }
  };

  // ============================================
  // PDF GENERATION
  // ============================================

  const generatePDF = (bill) => {
    const doc = new jsPDF();

    // ========================================
    // HEADER
    // ========================================

    doc.setFontSize(18);

    doc.setTextColor(30, 58, 138);

    doc.setFont(undefined, "bold");

    doc.text("MADHAV MEDICAL & GENERAL STORES", 105, 18, {
      align: "center",
    });

    doc.setFontSize(10);

    doc.setTextColor(80, 80, 80);

    doc.setFont(undefined, "normal");

    doc.text(
      "Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209",
      105,
      28,
      {
        align: "center",
      },
    );

    doc.setDrawColor(30, 58, 138);

    doc.line(10, 34, 200, 34);

    // ========================================
    // TITLE
    // ========================================

    doc.setFontSize(16);

    doc.setTextColor(30, 58, 138);

    doc.setFont(undefined, "bold");

    doc.text("PHARMACY BILL", 105, 44, {
      align: "center",
    });

    // ========================================
    // PATIENT DETAILS
    // ========================================

    let y = 60;

    doc.setFontSize(11);

    // LEFT

    doc.setFont(undefined, "bold");

    doc.text("Patient Name", 15, y);

    doc.text(":", 55, y);

    doc.setFont(undefined, "normal");

    doc.text(selectedPatient?.name || "-", 60, y);

    // RIGHT

    doc.setFont(undefined, "bold");

    doc.text("Doctor", 125, y);

    doc.text(":", 155, y);

    doc.setFont(undefined, "normal");

    doc.text(latestVisit?.doctorName || "-", 160, y);

    // ----------------------------------------

    y += 12;

    doc.setFont(undefined, "bold");

    doc.text("Bill No", 15, y);

    doc.text(":", 55, y);

    doc.setFont(undefined, "normal");

    doc.text(bill?.invoice?.invoiceNumber || bill?.invoiceNumber || "-", 60, y);

    doc.setFont(undefined, "bold");

    doc.text("Date", 125, y);

    doc.text(":", 155, y);

    doc.setFont(undefined, "normal");

    doc.text(formatDate(new Date()), 160, y);

    // ----------------------------------------

    y += 12;

    doc.setFont(undefined, "bold");

    doc.text("Mobile", 15, y);

    doc.text(":", 55, y);

    doc.setFont(undefined, "normal");

    doc.text(selectedPatient?.phone || "-", 60, y);

    doc.setFont(undefined, "bold");

    doc.text("Visit No", 125, y);

    doc.text(":", 155, y);

    doc.setFont(undefined, "normal");

    doc.text(latestVisit?.visitNumber || "-", 160, y);

    // ========================================
    // TABLE
    // ========================================

    y += 12;

    autoTable(doc, {
      startY: y,

      theme: "grid",

      head: [
        [
          "SI No",
          "Medicine",
          "Batch/Expiry",
          "Qty",
          "Price",
          "GST",
          "Subtotal",
        ],
      ],

      body: cart.map((item, index) => [
        index + 1,

        item.medicineName,

        `${item.batchNo || "-"}\nExp: ${
          formatExpiryDate(item.expiryDate) || "-"
        }`,

        item.quantity,

        item.unitPrice.toFixed(2),

        `${item.gstPercent}%`,

        (item.quantity * item.unitPrice).toFixed(2),
      ]),

      headStyles: {
        fillColor: [30, 58, 138],
      },

      columnStyles: {
        0: {
          cellWidth: 12,
        },

        1: {
          cellWidth: 55,
        },

        2: {
          cellWidth: 35,
        },

        3: {
          cellWidth: 15,
        },

        4: {
          cellWidth: 20,
        },

        5: {
          cellWidth: 15,
        },

        6: {
          cellWidth: 28,
        },
      },
    });

    // ========================================
    // TOTALS
    // ========================================

    const finalY = doc.lastAutoTable.finalY + 12;

    const rightX = 195;

    doc.setFontSize(11);

    doc.setFont(undefined, "bold");

    doc.text(`Subtotal : Rs. ${subtotal.toFixed(2)}`, rightX, finalY, {
      align: "right",
    });

    doc.text(`GST : Rs. ${gstAmount.toFixed(2)}`, rightX, finalY + 10, {
      align: "right",
    });

    doc.text(
      `Discount : Rs. ${Number(discount).toFixed(2)}`,
      rightX,
      finalY + 20,
      {
        align: "right",
      },
    );

    doc.setFontSize(15);

    doc.setTextColor(30, 58, 138);

    doc.text(
      `Grand Total : Rs. ${finalAmount.toFixed(2)}`,
      rightX,
      finalY + 35,
      {
        align: "right",
      },
    );

    // ========================================
    // SAVE PDF
    // ========================================

    const invoiceNo =
      bill?.invoice?.invoiceNumber || bill?.invoiceNumber || "PHARMACY-BILL";

    doc.save(`${invoiceNo}.pdf`);
  };

  return (
    <Box
      sx={{
        p: 2,
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ===================================== */}
      {/* SEARCH SECTION */}
      {/* ===================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "18px",

          background:
            "linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#06B6D4 100%)",

          color: "#fff",

          boxShadow: "0 10px 30px rgba(30,64,175,0.25)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search PRN / Name / Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
            sx={{
              width: 320,

              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",

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

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearchPatient}
            sx={{
              height: 48,

              borderRadius: "12px",

              textTransform: "none",

              fontWeight: 700,

              background: "#fff",

              color: "#1E40AF",

              "&:hover": {
                background: "#f1f5f9",
              },
            }}
          >
            Search Patient
          </Button>

          {selectedPatient && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",

                px: 2,
                py: 1,

                borderRadius: "12px",

                background: "rgba(255,255,255,0.12)",

                backdropFilter: "blur(10px)",
              }}
            >
              <Typography>
                <strong>Name:</strong> <strong>{selectedPatient.name}</strong>
              </Typography>

              <Typography>
                <strong>PRN:</strong>{" "}
                <strong>{selectedPatient.patientCode}</strong>
              </Typography>

              <Typography>
                <strong>Mobile:</strong> {selectedPatient.phone}
              </Typography>

              <Typography>
                <strong>Visit:</strong> {latestVisit?.visitNumber || "-"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ===================================== */}
      {/* MAIN CARD */}
      {/* ===================================== */}

      <Paper
        sx={{
          p: 3,

          borderRadius: 4,

          background: "rgba(255,255,255,0.80)",

          backdropFilter: "blur(12px)",

          border: "1px solid rgba(255,255,255,0.4)",

          boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Divider sx={{ mb: 3 }} />

            {/* ================================= */}
            {/* ADD MEDICINE */}
            {/* ================================= */}

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              <Autocomplete
                options={medicines}
                value={
                  medicines.find(
                    (m) => String(m.id) === String(selectedMedicineId),
                  ) || null
                }
                onChange={(event, value) =>
                  setSelectedMedicineId(value?.id || "")
                }
                getOptionLabel={(o) => o.medicineName || ""}
                sx={{
                  minWidth: 350,
                }}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    {option.medicineName}
                    &nbsp;
                    <Typography
                      variant="caption"
                      color={
                        option.stockQuantity <= 10 ? "error" : "success.main"
                      }
                    >
                      (Stock:
                      {option.stockQuantity})
                    </Typography>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="Search Medicine" />
                )}
              />

              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{
                  width: 120,
                }}
              />

              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                onClick={handleAddMedicine}
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
            </Box>

            {/* ================================= */}
            {/* TABLE */}
            {/* ================================= */}

            <TableContainer component={Paper}>
              <Table>
                <TableHead
                  sx={{
                    "& .MuiTableCell-root": {
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    },
                  }}
                >
                  <TableRow
                    sx={{
                      background: "linear-gradient(90deg,#1E40AF,#2563EB)",
                    }}
                  >
                    <TableCell>SI No</TableCell>

                    <TableCell>Medicine</TableCell>

                    <TableCell>Batch/Expiry</TableCell>

                    <TableCell>Qty</TableCell>

                    <TableCell>Price</TableCell>

                    <TableCell>GST</TableCell>

                    <TableCell>Subtotal</TableCell>

                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cart.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell>{item.medicineName}</TableCell>

                      <TableCell>
                        <Typography variant="body2">{item.batchNo}</Typography>

                        <Typography variant="caption">
                          Exp :{formatExpiryDate(item.expiryDate)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                          sx={{
                            width: 80,
                          }}
                        />
                      </TableCell>

                      <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>

                      <TableCell>{item.gstPercent}%</TableCell>

                      <TableCell>
                        ₹{(item.quantity * item.unitPrice).toFixed(2)}
                      </TableCell>

                      <TableCell>
                        <Button color="error" onClick={() => removeItem(index)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* ================================= */}
            {/* TOTALS */}
            {/* ================================= */}

            <Box
              sx={{
                mt: 3,

                display: "flex",

                justifyContent: "space-between",

                flexWrap: "wrap",
              }}
            >
              <TextField
                label="Discount"
                type="number"
                value={discount}
                onChange={handleDiscountChange}
              />

              <Grid item xs={12} md={3}>
                <TextField
                  select
                  sx={{
                    minWidth: 200,
                  }}
                  label="Payment Mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="CARD">Card</MenuItem>
                  <MenuItem value="INSURANCE">Insurance</MenuItem>
                </TextField>
              </Grid>

              <Box>
                <Typography>Subtotal : ₹{subtotal.toFixed(2)}</Typography>

                <Typography>GST : ₹{gstAmount.toFixed(2)}</Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "#1E40AF",
                    fontWeight: 700,
                  }}
                >
                  Grand Total : ₹{finalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* ================================= */}
            {/* ACTION BUTTONS */}
            {/* ================================= */}

            <Box
              sx={{
                mt: 4,

                display: "flex",

                justifyContent: "flex-end",

                gap: 2,
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
                Save Bill
              </Button>

              <Button
                variant="contained"
                startIcon={<ReceiptIcon />}
                onClick={() => generatePDF()}
                sx={{
                  height: 42,
                  minWidth: 110,
                  px: 4,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.3px",

                  background: "linear-gradient(135deg, #F59E0B, #D97706)",

                  color: "#fff",

                  boxShadow: "0 8px 24px rgba(245,158,11,0.25)",

                  transition: "all 0.3s ease",

                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 28px rgba(245,158,11,0.35)",

                    background: "linear-gradient(135deg, #FBBF24, #B45309)",
                  },

                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                Generate PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Paper>

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
