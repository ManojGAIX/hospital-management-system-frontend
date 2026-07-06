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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import PauseIcon from "@mui/icons-material/Pause";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import PaymentsIcon from "@mui/icons-material/Payments";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BarChartIcon from "@mui/icons-material/BarChart";

import api from "../services/api";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { savePharmacyBill } from "../api/pharmacyApi";
import { formatDate } from "../utils/dateFormatter";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";

// Helper component for statistics tiles in Today's Pharmacy card
const StatTile = ({ icon: Icon, label, value, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.2,
      background: "rgba(255, 255, 255, 0.07)",
      borderRadius: "12px",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      transition: "all 0.2s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.12)",
        borderColor: "rgba(255, 255, 255, 0.18)",
        transform: "translateY(-2px)",
      },
    }}
  >
    <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
      <Icon sx={{ color: color || "#fff", fontSize: 16, opacity: 0.95 }} />
      <Typography
        sx={{
          fontSize: "0.68rem",
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.8)",
          letterSpacing: "0.1px",
        }}
        noWrap
      >
        {label}
      </Typography>
    </Box>
    <Typography sx={{ fontSize: "0.95rem", fontWeight: 800, lineHeight: 1.2 }}>
      {value}
    </Typography>
  </Paper>
);

export default function PharmacyBilling() {
  const [tabIndex, setTabIndex] = useState(0); // 0 = Patient Billing, 1 = OTC Billing

  const [customerName, setCustomerName] = useState("");

  const [customerMobile, setCustomerMobile] = useState("");

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

  // Advanced search options
  const [searchBy, setSearchBy] = useState("name"); // name, barcode, batch, genericName

  // Split payment amounts
  const [cashPaid, setCashPaid] = useState("");
  const [upiPaid, setUpiPaid] = useState("");
  const [cardPaid, setCardPaid] = useState("");

  const [showStats, setShowStats] = useState(false);

  // Today stats card state
  const [stats, setStats] = useState({
    bills: 0,
    sales: 0,
    otc: 0,
    patient: 0,
    pending: 0,
    cash: 0,
    upi: 0,
    card: 0,
    insurance: 0,
  });

  // Held bills state
  const [heldBills, setHeldBills] = useState([]);

  // Print preview dialog state
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

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
  useEffect(() => {
    loadPatients();
    loadMedicines();
    loadStats();
    const saved = localStorage.getItem("held_pharmacy_bills");
    if (saved) {
      setHeldBills(JSON.parse(saved));
    }
  }, []);

  // ============================================
  // LOAD PATIENTS
  // ============================================

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/patients");

      setPatients(res.data.data || []);
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
  // LOAD STATS
  // ============================================

  const loadStats = async () => {
    try {
      const salesRes = await api.get("api/pharmacy/history");
      const salesList = salesRes.data || [];

      // Calculate today's stats
      const today = new Date();
      const todaySales = salesList.filter((sale) => {
        if (!sale.saleDate) return false;
        const d = new Date(sale.saleDate);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });

      const todayBills = todaySales.length;
      const todayRevenue = todaySales.reduce(
        (sum, s) => sum + (s.finalAmount || 0),
        0,
      );
      const todayOTC = todaySales
        .filter((s) => !s.patientId)
        .reduce((sum, s) => sum + (s.finalAmount || 0), 0);
      const todayPatient = todaySales
        .filter((s) => s.patientId)
        .reduce((sum, s) => sum + (s.finalAmount || 0), 0);

      let cashTotal = 0;
      let upiTotal = 0;
      let cardTotal = 0;
      let insuranceTotal = 0;

      todaySales.forEach((s) => {
        const mode = (s.paymentMode || "").toUpperCase();
        if (mode === "CASH") {
          cashTotal += s.finalAmount || 0;
        } else if (mode === "UPI") {
          upiTotal += s.finalAmount || 0;
        } else if (mode === "CARD") {
          cardTotal += s.finalAmount || 0;
        } else if (mode === "INSURANCE") {
          insuranceTotal += s.finalAmount || 0;
        } else if (mode === "SPLIT") {
          cashTotal += s.cashAmount || 0;
          upiTotal += s.upiAmount || 0;
          cardTotal += s.cardAmount || 0;
        }
      });

      // Fetch pending prescriptions
      const presRes = await api.get("api/prescriptions");
      const presList = presRes.data || [];
      const pendingCount = presList.filter((p) => !p.billed).length;

      setStats({
        bills: todayBills,
        sales: todayRevenue,
        otc: todayOTC,
        patient: todayPatient,
        pending: pendingCount,
        cash: cashTotal,
        upi: upiTotal,
        card: cardTotal,
        insurance: insuranceTotal,
      });
    } catch (err) {
      console.error("Failed to load pharmacy stats", err);
    }
  };

  // ============================================
  // SEARCH FILTER FOR MEDICINES
  // ============================================

  const filterMedicineOptions = (options, state) => {
    const inputValue = (state.inputValue || "").toLowerCase();
    return options.filter((o) => {
      if (!inputValue) return true;
      if (searchBy === "barcode") {
        return (o.barcode || "").toLowerCase().includes(inputValue);
      } else if (searchBy === "batch") {
        return (o.batchNo || "").toLowerCase().includes(inputValue);
      } else if (searchBy === "genericName") {
        return (o.genericName || "").toLowerCase().includes(inputValue);
      } else {
        return (o.medicineName || "").toLowerCase().includes(inputValue);
      }
    });
  };

  // ============================================
  // HOLD BILL
  // ============================================

  const handleHoldBill = () => {
    if (cart.length === 0) {
      showNotification("Cannot hold an empty bill", "warning");
      return;
    }
    const newHold = {
      id: Date.now(),
      timestamp: new Date(),
      tabIndex,
      customerName,
      customerMobile,
      selectedPatient,
      latestVisit,
      cart,
      discount,
      paymentMode,
      cashPaid,
      upiPaid,
      cardPaid,
      subtotal,
      finalAmount,
    };
    const updated = [newHold, ...heldBills];
    setHeldBills(updated);
    localStorage.setItem("held_pharmacy_bills", JSON.stringify(updated));
    showNotification("Bill placed on hold", "info");
    clearBill();
  };

  // ============================================
  // RESTORE HELD BILL
  // ============================================

  const handleRestoreHeldBill = (bill) => {
    setTabIndex(bill.tabIndex);
    setCustomerName(bill.customerName || "");
    setCustomerMobile(bill.customerMobile || "");
    setSelectedPatient(bill.selectedPatient || null);
    setLatestVisit(bill.latestVisit || null);
    setCart(bill.cart || []);
    setDiscount(bill.discount || 0);
    setPaymentMode(bill.paymentMode || "CASH");
    setCashPaid(bill.cashPaid || "");
    setUpiPaid(bill.upiPaid || "");
    setCardPaid(bill.cardPaid || "");

    const updated = heldBills.filter((b) => b.id !== bill.id);
    setHeldBills(updated);
    localStorage.setItem("held_pharmacy_bills", JSON.stringify(updated));
    showNotification("Held bill restored", "success");
  };

  // ============================================
  // DELETE HELD BILL
  // ============================================

  const handleDeleteHeldBill = (id) => {
    const updated = heldBills.filter((b) => b.id !== id);
    setHeldBills(updated);
    localStorage.setItem("held_pharmacy_bills", JSON.stringify(updated));
    showNotification("Held bill deleted", "info");
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

      const visitRes = await api.get(`/api/visits/active/${patient.id}`);

      if (!visitRes.data || visitRes.data.length === 0) {
        alert("No active visit found");
        return;
      }

      const activeVisit = visitRes.data[0];

      setLatestVisit(activeVisit);

      // ==========================================
      // LOAD PRESCRIPTIONS
      // ==========================================

      const prescriptionRes = await api.get(
        `/api/prescriptions/visit/${activeVisit.id}`,
      );

      const prescriptionItems = [];
      if (prescriptionRes.data && Array.isArray(prescriptionRes.data)) {
        prescriptionRes.data.forEach((prescription) => {
          if (prescription.items && Array.isArray(prescription.items)) {
            prescription.items.forEach((item) => {
              prescriptionItems.push(item);
            });
          }
        });
      }

      const prescriptionCart = prescriptionItems.map((p) => {
        const medicineMaster = medicines.find(
          (m) => m.id === p.medicineId || m.medicineName === p.medicineName,
        );

        const unitPrice = medicineMaster?.price || p.price || 0;

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

        const finalQty = p.quantity || dailyQty * (p.days || 1);

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

    setCustomerName("");

    setCustomerMobile("");

    setCashPaid("");

    setUpiPaid("");

    setCardPaid("");
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    clearBill();
    setPaymentMode("CASH");
  };

  // ============================================
  // LOAD EXISTING PHARMACY BILL
  // Example:
  // /api/pharmacy/1
  // ============================================

  const loadPharmacyInvoice = async (id) => {
    try {
      const res = await api.get(`/api/pharmacy/${id}`);

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
  // OPERATIONS METRICS FOR PHARMACIST
  // ============================================

  const outOfStockCount = medicines.filter(
    (m) => (m.stockQuantity || 0) <= 0,
  ).length;

  const lowStockCount = medicines.filter(
    (m) => (m.stockQuantity || 0) > 0 && (m.stockQuantity || 0) <= 10,
  ).length;

  const getNearExpiryCount = () => {
    const today = new Date();
    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(today.getDate() + 90);
    return medicines.filter((m) => {
      if (!m.expiryDate) return false;
      const exp = new Date(m.expiryDate);
      return exp > today && exp <= ninetyDaysLater;
    }).length;
  };

  const nearExpiryCount = getNearExpiryCount();
  const averageOrderValue =
    stats.bills > 0 ? Math.round(stats.sales / stats.bills) : 0;

  // ============================================
  // SAVE BILL
  // ============================================

  const handleSaveBill = async (shouldPrint = false) => {
    if (paymentMode === "SPLIT") {
      const totalPaid =
        Number(cashPaid || 0) + Number(upiPaid || 0) + Number(cardPaid || 0);
      if (Math.abs(totalPaid - finalAmount) > 0.01) {
        showNotification(
          `Split total (₹${totalPaid.toFixed(2)}) must equal Grand Total (₹${finalAmount.toFixed(2)})`,
          "error",
        );
        return;
      }
    }

    try {
      if (tabIndex === 0 && !selectedPatient) {
        showNotification("Search patient first", "warning");
        return;
      }

      if (cart.length === 0) {
        showNotification("Add medicines", "warning");
        return;
      }

      const payload = {
        patientId: tabIndex === 0 ? selectedPatient.id : null,

        visitId: tabIndex === 0 ? latestVisit?.id : null,

        patientName:
          tabIndex === 0
            ? selectedPatient.name
            : customerName.trim() || "Walk-in Customer",

        mobile:
          tabIndex === 0
            ? selectedPatient.phone
            : customerMobile.trim() || "N/A",

        subtotal,

        discount,

        gstAmount,

        finalAmount,

        paymentMode,

        cashAmount: paymentMode === "SPLIT" ? Number(cashPaid || 0) : null,

        upiAmount: paymentMode === "SPLIT" ? Number(upiPaid || 0) : null,

        cardAmount: paymentMode === "SPLIT" ? Number(cardPaid || 0) : null,

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

      showNotification("Pharmacy Bill Saved Successfully", "success");

      if (shouldPrint) {
        generatePDF(response.data);
      }

      clearBill();
      loadStats();
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

    const isOTC = tabIndex === 1;
    const displayName = isOTC
      ? customerName.trim() || "Walk-in Customer"
      : selectedPatient?.name || "-";
    const displayMobile = isOTC
      ? customerMobile.trim() || "N/A"
      : selectedPatient?.phone || "-";
    const displayDoctor = isOTC ? "Self / OTC" : latestVisit?.doctorName || "-";
    const displayVisit = isOTC ? "N/A" : latestVisit?.visitNumber || "-";

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

    doc.text(displayName, 60, y);

    // RIGHT

    doc.setFont(undefined, "bold");

    doc.text("Doctor", 125, y);

    doc.text(":", 155, y);

    doc.setFont(undefined, "normal");

    doc.text(displayDoctor, 160, y);

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

    doc.text(displayMobile, 60, y);

    doc.setFont(undefined, "bold");

    doc.text("Visit No", 125, y);

    doc.text(":", 155, y);

    doc.setFont(undefined, "normal");

    doc.text(displayVisit, 160, y);

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

    doc.text(`GST : Rs. ${gstAmount.toFixed(2)}`, rightX, finalY + 8, {
      align: "right",
    });

    doc.text(
      `Discount : Rs. ${Number(discount).toFixed(2)}`,
      rightX,
      finalY + 16,
      {
        align: "right",
      },
    );

    let offset = 24;
    if ((bill?.paymentMode || paymentMode) === "SPLIT") {
      const c =
        bill?.cashAmount !== undefined
          ? bill.cashAmount
          : Number(cashPaid || 0);
      const u =
        bill?.upiAmount !== undefined ? bill.upiAmount : Number(upiPaid || 0);
      const cd =
        bill?.cardAmount !== undefined
          ? bill.cardAmount
          : Number(cardPaid || 0);

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(`Paid Cash: Rs. ${c.toFixed(2)}`, rightX, finalY + offset, {
        align: "right",
      });
      offset += 6;
      doc.text(`Paid UPI: Rs. ${u.toFixed(2)}`, rightX, finalY + offset, {
        align: "right",
      });
      offset += 6;
      doc.text(`Paid Card: Rs. ${cd.toFixed(2)}`, rightX, finalY + offset, {
        align: "right",
      });
      offset += 8;
    } else {
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(
        `Pay Mode: ${bill?.paymentMode || paymentMode}`,
        rightX,
        finalY + offset,
        { align: "right" },
      );
      offset += 10;
    }

    doc.setFontSize(15);

    doc.setFont(undefined, "bold");

    doc.setTextColor(30, 58, 138);

    doc.text(
      `Grand Total : Rs. ${finalAmount.toFixed(2)}`,
      rightX,
      finalY + offset,
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
      {/* TABS FOR BILLING MODE ALIGNED TO THE LEFT */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#64748B",
            },
            "& .Mui-selected": {
              color: "#1E40AF !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#1E40AF",
              height: "3px",
              borderRadius: "3px",
            },
          }}
        >
          <Tab label="Patient Pharmacy" />
          <Tab label="OTC Billing" />
        </Tabs>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: { xs: "wrap", md: "nowrap" },
          alignItems: "flex-start",
        }}
      >
        {/* LEFT COLUMN: Billing Details */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* ===================================== */}
          {/* PATIENT BILLING SEARCH SECTION */}
          {/* ===================================== */}
          {tabIndex === 0 && (
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
                      <strong>Name:</strong>{" "}
                      <strong>{selectedPatient.name}</strong>
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
          )}

          {/* ===================================== */}
          {/* OTC BILLING CUSTOMER DETAILS */}
          {/* ===================================== */}
          {tabIndex === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: "18px",
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                color: "#fff",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.25)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "#38BDF8" }}
                >
                  Over-the-Counter (OTC) Billing
                </Typography>
                <Typography variant="body2" sx={{ color: "#94A3B8", mb: 0.5 }}>
                  Enter walk-in customer details below. No Patient ID or visit
                  registration is required.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <TextField
                    size="small"
                    label="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    sx={{
                      width: 280,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.4)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#38BDF8" },
                      },
                      "& .MuiInputLabel-root": { color: "#94A3B8" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#38BDF8" },
                    }}
                  />
                  <TextField
                    size="small"
                    label="Mobile Number"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="N/A"
                    sx={{
                      width: 220,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        borderRadius: "12px",
                        "& fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.2)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(255, 255, 255, 0.4)",
                        },
                        "&.Mui-focused fieldset": { borderColor: "#38BDF8" },
                      },
                      "& .MuiInputLabel-root": { color: "#94A3B8" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#38BDF8" },
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          )}

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
            <Card sx={{ borderRadius: 4 }}>
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
                    alignItems: "center",
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Search by"
                    value={searchBy}
                    onChange={(e) => setSearchBy(e.target.value)}
                    sx={{
                      minWidth: 140,
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="barcode">Barcode</MenuItem>
                    <MenuItem value="batch">Batch</MenuItem>
                    <MenuItem value="genericName">Generic Name</MenuItem>
                  </TextField>

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
                    filterOptions={filterMedicineOptions}
                    getOptionLabel={(o) => o.medicineName || ""}
                    sx={{
                      minWidth: 300,
                      flexGrow: 1,
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                    renderOption={(props, option) => (
                      <Box
                        component="li"
                        {...props}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          py: 1,
                          borderBottom: "1px solid #F1F5F9",
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          color="#0F172A"
                        >
                          {option.medicineName}
                          {option.genericName && (
                            <Typography
                              variant="caption"
                              sx={{
                                ml: 1,
                                color: "#64748B",
                                fontStyle: "italic",
                              }}
                            >
                              ({option.genericName})
                            </Typography>
                          )}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            mt: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          <Chip
                            size="small"
                            label={`MRP: ₹${option.price || 0}`}
                            sx={{
                              bgcolor: "#EFF6FF",
                              color: "#1D4ED8",
                              fontWeight: 600,
                              height: 20,
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Stock: ${option.stockQuantity || 0}`}
                            color={
                              option.stockQuantity <= 10 ? "error" : "success"
                            }
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 20 }}
                          />
                          <Chip
                            size="small"
                            label={`Batch: ${option.batchNo || "N/A"}`}
                            sx={{
                              bgcolor: "#F8FAFC",
                              color: "#475569",
                              height: 20,
                            }}
                          />
                          <Chip
                            size="small"
                            label={`Expiry: ${option.expiryDate ? new Date(option.expiryDate).toLocaleDateString("en-US", { month: "2-digit", year: "numeric" }) : "N/A"}`}
                            sx={{
                              bgcolor: "#FEF2F2",
                              color: "#B91C1C",
                              height: 20,
                            }}
                          />
                        </Box>
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
                      width: 100,
                      "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                    }}
                  />

                  <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={handleAddMedicine}
                    sx={{
                      height: 48,
                      px: 3,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #1E40AF, #06B6D4)",
                      color: "#fff",
                      boxShadow: "0 8px 24px rgba(30,64,175,0.2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #1D4ED8, #0891B2)",
                      },
                    }}
                  >
                    Add
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
                          background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
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
                            <Typography variant="body2">
                              {item.batchNo}
                            </Typography>
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
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell>₹{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.gstPercent}%</TableCell>
                          <TableCell>
                            ₹{(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              color="error"
                              onClick={() => removeItem(index)}
                            >
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
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Discount"
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                  />

                  <TextField
                    select
                    sx={{ minWidth: 200 }}
                    label="Payment Mode"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="CARD">Card</MenuItem>
                    <MenuItem value="SPLIT">Split Payment</MenuItem>
                    {tabIndex === 0 && (
                      <MenuItem value="INSURANCE">Insurance</MenuItem>
                    )}
                  </TextField>

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

                {/* SPLIT BREAKDOWN INPUTS */}
                {paymentMode === "SPLIT" && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2.5,
                      borderRadius: "14px",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="#1E293B"
                      sx={{ mb: 2 }}
                    >
                      Split Payment Breakdown
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Cash Paid (₹)"
                          type="number"
                          value={cashPaid}
                          onChange={(e) => setCashPaid(e.target.value)}
                          placeholder="0.00"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="UPI Paid (₹)"
                          type="number"
                          value={upiPaid}
                          onChange={(e) => setUpiPaid(e.target.value)}
                          placeholder="0.00"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Card Paid (₹)"
                          type="number"
                          value={cardPaid}
                          onChange={(e) => setCardPaid(e.target.value)}
                          placeholder="0.00"
                        />
                      </Grid>
                    </Grid>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      sx={{ mt: 2, px: 0.5 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Split Total: ₹
                        {(
                          Number(cashPaid || 0) +
                          Number(upiPaid || 0) +
                          Number(cardPaid || 0)
                        ).toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={
                          Math.abs(
                            Number(cashPaid || 0) +
                              Number(upiPaid || 0) +
                              Number(cardPaid || 0) -
                              finalAmount,
                          ) < 0.01
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {Math.abs(
                          Number(cashPaid || 0) +
                            Number(upiPaid || 0) +
                            Number(cardPaid || 0) -
                            finalAmount,
                        ) < 0.01
                          ? "✓ Fully Allocated"
                          : `Remaining: ₹${(finalAmount - (Number(cashPaid || 0) + Number(upiPaid || 0) + Number(cardPaid || 0))).toFixed(2)}`}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* ================================= */}
                {/* ACTION BUTTONS */}
                {/* ================================= */}
                <Box
                  sx={{
                    mt: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box display="flex" gap={1.5}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={clearBill}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Cancel / Clear
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PauseIcon />}
                      onClick={handleHoldBill}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#64748B",
                        color: "#64748B",
                        "&:hover": {
                          borderColor: "#475569",
                          background: "#F8FAFC",
                        },
                      }}
                    >
                      Hold Bill
                    </Button>
                  </Box>

                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={() => setPrintPreviewOpen(true)}
                      sx={{
                        height: 44,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #F59E0B, #D97706)",
                        boxShadow: "0 4px 12px rgba(245,158,11,0.2)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #D97706, #B45309)",
                        },
                      }}
                    >
                      Print Preview
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveBill(false)}
                      sx={{
                        height: 44,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #1D4ED8, #1E40AF)",
                        },
                      }}
                    >
                      Save Bill
                    </Button>

                    <Button
                      variant="contained"
                      startIcon={<ReceiptIcon />}
                      onClick={() => handleSaveBill(true)}
                      sx={{
                        height: 44,
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #10B981, #059669)",
                        boxShadow: "0 4px 12px rgba(16,185,129,0.2)",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #059669, #047857)",
                        },
                      }}
                    >
                      Save & Print
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Box>

        {/* RIGHT COLUMN: Statistics Dashboard & Held Bills */}
        <Box
          sx={{
            position: "relative",
            width: showStats
              ? { xs: "100%", md: 220, lg: 240 }
              : { xs: 0, md: 0, lg: 0 },
            transition: "width .35s ease",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          {/* STATISTICS CARD */}
         <Card
            sx={{
			        borderRadius: "16px",
              background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
              color: "#fff",
              boxShadow: "0 10px 25px rgba(30, 58, 138, 0.15)",
              mb: 3,
			  
              transform: showStats ? "translateX(0)" : "translateX(110%)",

              transition: "transform .35s ease",

              width: 240,

              position: "relative",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ opacity: 0.9, mb: 2 }}
              >
                Today's Pharmacy
              </Typography>

              <Grid container spacing={1.2}>
                <Grid item xs={6}>
                  <StatTile
                    icon={ReceiptIcon}
                    label="Bills"
                    value={stats.bills}
                    color="#93C5FD"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={TrendingUpIcon}
                    label="Total Sales"
                    value={`₹${stats.sales.toLocaleString("en-IN")}`}
                    color="#34D399"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={PaymentsIcon}
                    label="Cash Sales"
                    value={`₹${stats.cash.toLocaleString("en-IN")}`}
                    color="#FBBF24"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={QrCodeIcon}
                    label="UPI Sales"
                    value={`₹${stats.upi.toLocaleString("en-IN")}`}
                    color="#60A5FA"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={CreditCardIcon}
                    label="Card Sales"
                    value={`₹${stats.card.toLocaleString("en-IN")}`}
                    color="#F472B6"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={SecurityIcon}
                    label="Insurance"
                    value={`₹${stats.insurance.toLocaleString("en-IN")}`}
                    color="#A78BFA"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={ShoppingBagIcon}
                    label="OTC Sales"
                    value={`₹${stats.otc.toLocaleString("en-IN")}`}
                    color="#38BDF8"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={AccountCircleIcon}
                    label="Patient Sales"
                    value={`₹${stats.patient.toLocaleString("en-IN")}`}
                    color="#FB7185"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={HourglassEmptyIcon}
                    label="Pending Presc."
                    value={stats.pending}
                    color="#FDE047"
                  />
                </Grid>
                <Grid item xs={6}>
                  <StatTile
                    icon={BarChartIcon}
                    label="Avg Bill"
                    value={`₹${averageOrderValue.toLocaleString("en-IN")}`}
                    color="#2DD4BF"
                  />
                </Grid>
              </Grid>

              {/* STOCK STATUS SUMMARY CARD */}
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.85)",
                    mb: 1,
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Live Stock Status
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      sx={{
                        color: "#F87171",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      {outOfStockCount}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                      }}
                    >
                      Out of Stock
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    textAlign="center"
                    sx={{
                      borderLeft: "1px solid rgba(255,255,255,0.1)",
                      borderRight: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FBBF24",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      {lowStockCount}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                      }}
                    >
                      Low Stock
                    </Typography>
                  </Grid>
                  <Grid item xs={4} textAlign="center">
                    <Typography
                      sx={{
                        color: "#FDE047",
                        fontWeight: 800,
                        fontSize: "0.95rem",
                      }}
                    >
                      {nearExpiryCount}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                      }}
                    >
                      Near Expiry
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* SECTION 2: INVENTORY ALERTS */}
              {(() => {
                const lowStockList = medicines
                  .filter((m) => (m.stockQuantity || 0) <= 10)
                  .slice(0, 3);
                const today = new Date();
                const ninetyDaysLater = new Date();
                ninetyDaysLater.setDate(today.getDate() + 90);

                const nearExpiryList = medicines
                  .filter((m) => {
                    if (!m.expiryDate) return false;
                    const exp = new Date(m.expiryDate);
                    return exp > today && exp <= ninetyDaysLater;
                  })
                  .slice(0, 2);

                if (lowStockList.length === 0 && nearExpiryList.length === 0)
                  return null;

                return (
                  <>
                    <Divider
                      sx={{ borderColor: "rgba(255, 255, 255, 0.15)", my: 2 }}
                    />
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      sx={{
                        mb: 1.5,
                        opacity: 0.9,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <WarningIcon sx={{ color: "#FDE047" }} fontSize="small" />{" "}
                      Inventory Alerts
                    </Typography>

                    <Stack spacing={1.5}>
                      {lowStockList.map((m) => (
                        <Box
                          key={m.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.8 }}
                            noWrap
                            sx={{ maxWidth: "140px" }}
                          >
                            {m.medicineName}
                          </Typography>
                          <Chip
                            label={`${m.stockQuantity || 0} left`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 18,
                              fontSize: "0.7rem",
                              color: "#EF4444",
                              bgcolor: "#FEF2F2",
                              border: "none",
                            }}
                          />
                        </Box>
                      ))}
                      {nearExpiryList.map((m) => {
                        const expDate = new Date(m.expiryDate);
                        return (
                          <Box
                            key={m.id}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="body2"
                              sx={{ opacity: 0.8 }}
                              noWrap
                              sx={{ maxWidth: "140px" }}
                            >
                              {m.medicineName}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ color: "#FDE047" }}
                            >
                              Exp:{" "}
                              {expDate.toLocaleDateString("en-US", {
                                month: "short",
                                year: "2-digit",
                              })}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </>
                );
              })()}

              {/* SECTION 3: HELD BILLS */}
              {heldBills.length > 0 && (
                <>
                  <Divider
                    sx={{ borderColor: "rgba(255, 255, 255, 0.15)", my: 2 }}
                  />
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    sx={{ mb: 1.5, opacity: 0.9 }}
                  >
                    Held Bills ({heldBills.length})
                  </Typography>
                  <Stack spacing={1}>
                    {heldBills.map((b) => (
                      <Paper
                        key={b.id}
                        sx={{
                          p: 1.5,
                          borderRadius: "10px",
                          cursor: "pointer",
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "#fff",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.2)",
                            borderColor: "rgba(255, 255, 255, 0.3)",
                          },
                        }}
                        onClick={() => handleRestoreHeldBill(b)}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {b.tabIndex === 0
                                ? b.selectedPatient?.name
                                : b.customerName || "Walk-in"}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {b.cart.length} item(s) • ₹
                              {b.finalAmount.toFixed(0)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHeldBill(b.id);
                            }}
                            sx={{
                              p: 0.2,
                              color: "rgba(255,255,255,0.7)",
                              "&:hover": { color: "#EF4444" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>

          <IconButton
            onClick={() => setShowStats(!showStats)}
            sx={{
              position: "absolute",
              top: 80,
              left: showStats ? -18 : -40,

              width: 34,
              height: 70,

              borderRadius: "18px 0 0 18px",

              bgcolor: "#1E3A8A",
              color: "#fff",

              boxShadow: 3,

              "&:hover": {
                bgcolor: "#2563EB",
              },

              transition: "all .35s ease",
              zIndex: 20,
            }}
          >
            {showStats ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* PRINT PREVIEW DIALOG */}
      <Dialog
        open={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
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
          <Typography variant="h6" fontWeight={700}>
            Bill Print Preview
          </Typography>
          <IconButton onClick={() => setPrintPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            id="printable-bill-area"
            sx={{
              p: 3,
              background: "#fff",
              color: "#000",
              fontFamily: "monospace",
            }}
          >
            <Box textAlign="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>
                MADHAV MEDICAL & GENERAL STORES
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road,
                Indi - 586209
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ mt: 1, textDecoration: "underline" }}
              >
                PHARMACY BILL
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2">
                  <strong>Customer Name:</strong>{" "}
                  {tabIndex === 0
                    ? selectedPatient?.name || "-"
                    : customerName || "Walk-in Customer"}
                </Typography>
                <Typography variant="body2">
                  <strong>Mobile:</strong>{" "}
                  {tabIndex === 0
                    ? selectedPatient?.phone || "-"
                    : customerMobile || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">
                  <strong>Bill No:</strong> PREVIEW
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </Typography>
                {tabIndex === 0 && (
                  <Typography variant="body2">
                    <strong>Doctor:</strong> {latestVisit?.doctorName || "-"}
                  </Typography>
                )}
              </Grid>
            </Grid>

            <Table
              size="small"
              sx={{
                borderTop: "1px dashed #000",
                borderBottom: "1px dashed #000",
                mb: 2,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#000", fontWeight: "bold" }}>
                    Item
                  </TableCell>
                  <TableCell
                    sx={{ color: "#000", fontWeight: "bold" }}
                    align="right"
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    sx={{ color: "#000", fontWeight: "bold" }}
                    align="right"
                  >
                    Price
                  </TableCell>
                  <TableCell
                    sx={{ color: "#000", fontWeight: "bold" }}
                    align="right"
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "#000" }}>
                      {item.medicineName}
                    </TableCell>
                    <TableCell sx={{ color: "#000" }} align="right">
                      {item.quantity}
                    </TableCell>
                    <TableCell sx={{ color: "#000" }} align="right">
                      ₹{item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ color: "#000" }} align="right">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              <Typography variant="body2">
                Subtotal : ₹{subtotal.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                GST (5%) : ₹{gstAmount.toFixed(2)}
              </Typography>
              {discount > 0 && (
                <Typography variant="body2">
                  Discount : -₹{discount.toFixed(2)}
                </Typography>
              )}
              {paymentMode === "SPLIT" ? (
                <Box textAlign="right" sx={{ mb: 1 }}>
                  <Typography variant="caption" display="block">
                    Paid (Cash): ₹{cashPaid || 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Paid (UPI): ₹{upiPaid || 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Paid (Card): ₹{cardPaid || 0}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">
                  Payment Mode: {paymentMode}
                </Typography>
              )}
              <Typography variant="subtitle1" fontWeight={800}>
                Grand Total : ₹{finalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPrintPreviewOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => {
              setPrintPreviewOpen(false);
              generatePDF();
            }}
            sx={{ bgcolor: "#1E40AF" }}
          >
            Print / PDF
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
