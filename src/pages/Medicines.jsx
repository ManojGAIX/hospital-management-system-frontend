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
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";

// Icons
import MedicationIcon from "@mui/icons-material/Medication";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import PaymentsIcon from "@mui/icons-material/Payments";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";

import * as XLSX from "xlsx";
import api from "../services/api";

import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../api/medicineApi";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  "& .MuiInputLabel-root": {
    fontWeight: 650,
  },
};

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#1E40AF",
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {icon}
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{ color: "#64748b", fontWeight: 650, mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}

// CSS-based mock barcode generator
const BarcodeRenderer = ({ value }) => {
  const chars = String(value || "1234567890");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
        border: "1px solid #ddd",
        borderRadius: "8px",
        bgcolor: "#fff",
        width: "fit-content",
        mx: "auto",
      }}
    >
      <Box
        sx={{ display: "flex", height: "60px", alignItems: "flex-end", mb: 1 }}
      >
        {chars.split("").map((char, i) => {
          const code = char.charCodeAt(0);
          const width1 = ((code % 4) + 1) * 1.5;
          const width2 = (((code >> 2) % 3) + 1) * 1.5;
          return (
            <React.Fragment key={i}>
              <Box
                sx={{
                  width: `${width1}px`,
                  height: "100%",
                  bgcolor: "#000",
                  mr: `${width2}px`,
                }}
              />
              <Box sx={{ width: "1.5px", height: "100%", bgcolor: "#fff" }} />
            </React.Fragment>
          );
        })}
      </Box>
      <Typography
        variant="body2"
        sx={{ fontFamily: "monospace", letterSpacing: 3, fontWeight: "bold" }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [tabIndex, setTabIndex] = useState(0); // 0 = Inventory Stock List (Default first tab), 1 = Medicine Entry (Second tab)

  // Form State
  const [itemCode, setItemCode] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("");
  const [dosageType, setDosageType] = useState("");
  const [unit, setUnit] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [price, setPrice] = useState(""); // Selling Price
  const [gstPercent, setGstPercent] = useState(0);
  const [stockQuantity, setStockQuantity] = useState("");
  const [minimumStockLevel, setMinimumStockLevel] = useState(10);
  const [reorderLevel, setReorderLevel] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [rackLocation, setRackLocation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Active");

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);

  // Page State
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  // Print Barcode state
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [printBarcodeValue, setPrintBarcodeValue] = useState("");
  const [printMedicineName, setPrintMedicineName] = useState("");
  const [printMrp, setPrintMrp] = useState("");

  useEffect(() => {
    loadMedicines();
    loadSuppliers();
  }, []);

  const loadMedicines = async () => {
    try {
      const res = await getMedicines();
      setMedicines(res.data || []);
    } catch (err) {
      console.error("Failed to load medicines:", err);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get("/api/suppliers");
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const name = m.medicineName?.toLowerCase() || "";
    const code = m.itemCode?.toLowerCase() || "";
    const batch = m.batchNo?.toLowerCase() || "";
    const manufacturerName = m.manufacturer?.toLowerCase() || "";
    const supplierName = m.supplier?.toLowerCase() || "";
    const searchText = search.toLowerCase();
    return (
      name.includes(searchText) ||
      code.includes(searchText) ||
      batch.includes(searchText) ||
      manufacturerName.includes(searchText) ||
      supplierName.includes(searchText)
    );
  });

  const handleSubmit = async () => {
    // Validations
    if (!medicineName) {
      alert("Medicine Name is mandatory.");
      return;
    }
    if (!genericName) {
      alert("Generic Name is mandatory.");
      return;
    }
    if (!manufacturer) {
      alert("Manufacturer is mandatory.");
      return;
    }
    if (!category) {
      alert("Category is mandatory.");
      return;
    }
    if (!dosageType) {
      alert("Dosage Type is mandatory.");
      return;
    }
    if (!unit) {
      alert("Unit is mandatory.");
      return;
    }
    if (!batchNo) {
      alert("Batch Number is mandatory.");
      return;
    }
    if (!supplier) {
      alert("Supplier is mandatory.");
      return;
    }
    if (!expiryDate) {
      alert("Expiry Date is mandatory.");
      return;
    }

    // Expiry Date must be after the current date
    const expDate = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expDate <= today) {
      alert("Expiry Date must be in the future.");
      return;
    }

    // Stock Quantity cannot be negative
    if (Number(stockQuantity) < 0) {
      alert("Stock Quantity cannot be negative.");
      return;
    }

    // Purchase Price validation
    if (Number(purchasePrice) <= 0) {
      alert("Purchase Price must be greater than zero.");
      return;
    }

    // MRP validation
    if (Number(mrp) < Number(purchasePrice)) {
      alert("MRP should be greater than or equal to Purchase Price.");
      return;
    }

    // Selling Price validation
    if (Number(price) < Number(purchasePrice)) {
      alert("Selling Price should be greater than or equal to Purchase Price.");
      return;
    }

    // Batch Number cannot be duplicated for the same medicine
    const duplicate = medicines.find(
      (m) =>
        m.id !== editId &&
        m.medicineName?.toUpperCase() === medicineName.toUpperCase() &&
        m.batchNo?.toUpperCase() === batchNo.toUpperCase(),
    );
    if (duplicate) {
      alert(
        `Batch Number "${batchNo}" already exists for Medicine "${medicineName}".`,
      );
      return;
    }

    // Auto-generate Item Code if it is a new medicine
    let finalItemCode = itemCode;
    if (!editId) {
      const nextId =
        medicines.length > 0 ? Math.max(...medicines.map((m) => m.id)) + 1 : 1;
      finalItemCode = `ITM-${String(nextId).padStart(4, "0")}`;
    }

    const payload = {
      itemCode: finalItemCode.toUpperCase(),
      medicineName: medicineName.toUpperCase(),
      genericName: genericName.toUpperCase(),
      manufacturer: manufacturer.toUpperCase(),
      category: category.toUpperCase(),
      dosageType: dosageType.toUpperCase(),
      unit: unit.toUpperCase(),
      batchNo: batchNo.toUpperCase(),
      supplier: supplier,
      manufacturingDate: manufacturingDate || null,
      expiryDate: expiryDate || null,
      purchasePrice: Number(purchasePrice),
      mrp: Number(mrp),
      price: Number(price), // Selling Price
      gstPercent: Number(gstPercent || 0),
      stockQuantity: Number(stockQuantity),
      minimumStockLevel: Number(minimumStockLevel || 10),
      reorderLevel: reorderLevel ? Number(reorderLevel) : 0,
      hsnCode: hsnCode.toUpperCase(),
      barcode: barcode.toUpperCase() || finalItemCode.toUpperCase(),
      rackLocation: rackLocation.toUpperCase(),
      status: status,
      remarks: remarks,
    };

    try {
      if (editId) {
        await updateMedicine(editId, payload);
        alert("Medicine updated successfully!");
      } else {
        await createMedicine(payload);
        alert("New medicine added successfully!");
      }
      resetForm();
      loadMedicines();
      setTabIndex(0); // Redirect to inventory table tab (Tab 0) after saving
    } catch (err) {
      console.error(err);
      alert("Failed to save medicine data.");
    }
  };

  const handleEdit = (med) => {
    setEditId(med.id);
    setItemCode(med.itemCode || "");
    setMedicineName(med.medicineName || "");
    setGenericName(med.genericName || "");
    setManufacturer(med.manufacturer || "");
    setCategory(med.category || "");
    setDosageType(med.dosageType || "");
    setUnit(med.unit || "");
    setBatchNo(med.batchNo || "");
    setSupplier(med.supplier || "");
    setManufacturingDate(med.manufacturingDate || "");
    setExpiryDate(med.expiryDate || "");
    setPurchasePrice(med.purchasePrice || "");
    setMrp(med.mrp || "");
    setPrice(med.price || ""); // Selling Price
    setGstPercent(med.gstPercent || 0);
    setStockQuantity(med.stockQuantity || "");
    setMinimumStockLevel(med.minimumStockLevel || 10);
    setReorderLevel(med.reorderLevel || "");
    setHsnCode(med.hsnCode || "");
    setBarcode(med.barcode || "");
    setRackLocation(med.rackLocation || "");
    setStatus(med.status || "Active");
    setRemarks(med.remarks || "");
    setTabIndex(1); // Switch to Medicine Entry Tab (Tab 1) on edit
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this medicine?")) {
      try {
        await deleteMedicine(id);
        loadMedicines();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setEditId(null);
    setItemCode("");
    setMedicineName("");
    setGenericName("");
    setManufacturer("");
    setCategory("");
    setDosageType("");
    setUnit("");
    setBatchNo("");
    setSupplier("");
    setManufacturingDate("");
    setExpiryDate("");
    setPurchasePrice("");
    setMrp("");
    setPrice("");
    setGstPercent(0);
    setStockQuantity("");
    setMinimumStockLevel(10);
    setReorderLevel("");
    setBarcode("");
    setRackLocation("");
    setStatus("Active");
    setRemarks("");
  };

  const exportToExcel = () => {
    const excelData = filteredMedicines.map((m) => ({
      "Item Code": m.itemCode || "N/A",
      "Medicine Name": m.medicineName || "",
      "Generic Name": m.genericName || "",
      Manufacturer: m.manufacturer || "",
      Category: m.category || "",
      "Dosage Type": m.dosageType || "",
      Unit: m.unit || "",
      "Batch No": m.batchNo || "",
      Supplier: m.supplier || "",
      "Manufacturing Date": m.manufacturingDate || "",
      "Expiry Date": m.expiryDate || "",
      "Purchase Price": m.purchasePrice || 0,
      MRP: m.mrp || 0,
      "Selling Price": m.price || 0,
      "GST %": m.gstPercent || 0,
      "Stock Qty": m.stockQuantity || 0,
      "Minimum Stock": m.minimumStockLevel || 0,
      "Reorder Level": m.reorderLevel || 0,
      "HSN Code": m.hsnCode || "",
      Barcode: m.barcode || "",
      "Rack Location": m.rackLocation || "",
      Status: m.status || "Active",
      Remarks: m.remarks || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");
    XLSX.writeFile(workbook, "MedicineMaster.xlsx");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        let successCount = 0;
        for (const row of json) {
          const payload = {
            itemCode: String(row["Item Code"] || "").toUpperCase(),
            medicineName: String(
              row["Medicine Name"] || row["Medicine"] || "",
            ).toUpperCase(),
            genericName: String(row["Generic Name"] || "").toUpperCase(),
            manufacturer: String(
              row["Manufacturer"] || row["Company"] || "",
            ).toUpperCase(),
            category: String(row["Category"] || "").toUpperCase(),
            dosageType: String(
              row["Dosage Type"] || row["Dosage"] || "",
            ).toUpperCase(),
            unit: String(row["Unit"] || "").toUpperCase(),
            batchNo: String(
              row["Batch No"] || row["Batch"] || "",
            ).toUpperCase(),
            supplier: String(row["Supplier"] || "").toUpperCase(),
            manufacturingDate: row["Manufacturing Date"] || null,
            expiryDate: row["Expiry Date"] || row["Expiry"] || null,
            purchasePrice: Number(row["Purchase Price"] || 0),
            mrp: Number(row["MRP"] || 0),
            price: Number(row["Selling Price"] || row["Price"] || 0),
            gstPercent: Number(row["GST %"] || row["GST"] || 0),
            stockQuantity: Number(row["Stock Qty"] || row["Stock"] || 0),
            minimumStockLevel: Number(row["Minimum Stock"] || 10),
            reorderLevel: Number(row["Reorder Level"] || 0),
            hsnCode: String(row["HSN Code"] || row["HSN"] || "").toUpperCase(),
            barcode: String(row["Barcode"] || "").toUpperCase(),
            rackLocation: String(row["Rack Location"] || "").toUpperCase(),
            status: String(row["Status"] || "Active"),
            remarks: String(row["Remarks"] || ""),
          };

          if (payload.medicineName) {
            await createMedicine(payload);
            successCount++;
          }
        }
        alert(`Successfully imported ${successCount} medicines!`);
        loadMedicines();
      } catch (err) {
        console.error(err);
        alert("Failed to parse or import Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePrintBarcodeClick = (med) => {
    setPrintBarcodeValue(med.barcode || med.itemCode || "ITM-0000");
    setPrintMedicineName(med.medicineName || "");
    setPrintMrp(med.price || 0);
    setBarcodePrintOpen(true);
  };

  const handlePrintBarcodeTrigger = () => {
    window.print();
  };

  // Dashboard Stats Calculations
  const totalMedicines = medicines.length;
  const availableStock = medicines.reduce(
    (sum, m) => sum + (Number(m.stockQuantity) || 0),
    0,
  );
  const lowStockCount = medicines.filter((m) => {
    const qty = Number(m.stockQuantity) || 0;
    const min = Number(m.minimumStockLevel) || 10;
    return qty <= min && qty > 0;
  }).length;
  const outOfStockCount = medicines.filter(
    (m) => (Number(m.stockQuantity) || 0) === 0,
  ).length;
  const expiringSoonCount = medicines.filter((m) => {
    if (!m.expiryDate) return false;
    const exp = new Date(m.expiryDate);
    const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  }).length;

  const getStatusBadge = (med) => {
    if (med.status === "Inactive") {
      return (
        <Chip
          label="Inactive"
          size="small"
          variant="filled"
          sx={{ fontWeight: "bold", bgcolor: "#94A3B8", color: "#fff" }}
        />
      );
    }
    if (med.status === "Discontinued") {
      return (
        <Chip
          label="Discontinued"
          size="small"
          variant="filled"
          sx={{ fontWeight: "bold", bgcolor: "#EF4444", color: "#fff" }}
        />
      );
    }

    // Expiry Check
    const expDate = med.expiryDate ? new Date(med.expiryDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expDate && expDate <= today) {
      return (
        <Chip
          label="Expired"
          color="error"
          size="small"
          variant="filled"
          sx={{ fontWeight: "bold" }}
        />
      );
    }

    const qty = Number(med.stockQuantity) || 0;
    const reorder = Number(med.reorderLevel) || 0;

    if (qty === 0) {
      return (
        <Chip
          label="Out of Stock"
          color="error"
          size="small"
          variant="filled"
          sx={{ fontWeight: "bold" }}
        />
      );
    }
    if (qty <= reorder) {
      return (
        <Chip
          label="Low Stock"
          color="warning"
          size="small"
          variant="filled"
          sx={{ fontWeight: "bold" }}
        />
      );
    }
    return (
      <Chip
        label="In Stock"
        color="success"
        size="small"
        variant="filled"
        sx={{ fontWeight: "bold" }}
      />
    );
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box
      sx={{ padding: "16px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
    >
      {/* Print bar CSS styling */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden !important;
            }
            #barcode-print-area, #barcode-print-area * {
              visibility: visible !important;
            }
            #barcode-print-area {
              position: absolute;
              left: 50%;
              top: 30%;
              transform: translate(-50%, -50%);
              width: fit-content;
              margin: 0;
              padding: 20px;
              border: 1px solid #000;
              border-radius: 8px;
              background-color: #fff !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      {/* Main Page Tabs Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "1rem",
            },
            "& .Mui-selected": { color: "#1e3a8a !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#1e3a8a" },
          }}
        >
          <Tab label="Inventory Stock List" />
          <Tab label="Medicine Entry" />
        </Tabs>

        {tabIndex === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setTabIndex(1);
            }}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px" }}
          >
            Add New Medicine
          </Button>
        )}
      </Box>

      {/* Tab 0: Inventory Stock List (Default Screen) */}
      {tabIndex === 0 && (
        <Box>
          {/* Dashboard KPI cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "repeat(5, 1fr)",
              },
              gap: 2,
              mb: 4,
            }}
          >
            <Card
              sx={{
                background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8, fontWeight: 600 }}
                >
                  Total Medicines
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {totalMedicines}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #10B981, #047857)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8, fontWeight: 600 }}
                >
                  Available Stock
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {availableStock}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #F59E0B, #B45309)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8, fontWeight: 600 }}
                >
                  Low Stock
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {lowStockCount}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #EC4899, #BE185D)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(236,72,153,0.25)",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8, fontWeight: 600 }}
                >
                  Expiring Soon
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {expiringSoonCount}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: "linear-gradient(135deg, #EF4444, #B91C1C)",
                color: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(239,68,68,0.25)",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{ opacity: 0.8, fontWeight: 600 }}
                >
                  Out of Stock
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                  {outOfStockCount}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Table Toolbar / Header Section */}
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InventoryIcon sx={{ color: "#1e3a8a" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#1e3a8a" }}
              >
                Current Inventory list
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                placeholder="Search master inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                sx={{ width: "240px", bgcolor: "#fff", borderRadius: 1 }}
              />

              <Button
                variant="contained"
                color="primary"
                startIcon={<FileUploadIcon />}
                component="label"
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Import Excel
                <input
                  type="file"
                  hidden
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                />
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownloadIcon />}
                onClick={exportToExcel}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Export Excel
              </Button>
            </Box>
          </Box>

          {/* Data Table */}
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "12px",
              border: "1px solid #e0e6ed",
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead
                sx={{ background: "linear-gradient(90deg, #1E40AF, #3B82F6)" }}
              >
                <TableRow>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>SI No</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>ITEM CODE</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>MEDICINE NAME</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>BATCH NO</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>EXPIRY DATE</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>STOCK QTY</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }}>STATUS</TableCell>
                  <TableCell sx={{ color: "#fff", fontWeight: "bold", whiteSpace: "nowrap" }} align="center">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMedicines
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((med, index) => (
                    <TableRow
                      key={med.id}
                      hover
                      sx={{
                        "&:nth-of-type(even)": { backgroundColor: "#f8faff" },
                      }}
                    >
                      <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                        {med.itemCode || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {med.medicineName}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "monospace", color: "#0F172A" }}>
                        {med.batchNo}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {med.expiryDate || "N/A"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {med.stockQuantity}
                      </TableCell>
                      <TableCell>{getStatusBadge(med)}</TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Tooltip title="Edit Medicine">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(med)}
                              sx={{
                                backgroundColor: "#0ea5e9",
                                color: "white",
                                p: 0.5,
                                "&:hover": { backgroundColor: "#0284c7" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Medicine">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(med.id)}
                              sx={{
                                backgroundColor: "#ef4444",
                                color: "white",
                                p: 0.5,
                                "&:hover": { backgroundColor: "#dc2626" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Print Barcode">
                            <IconButton
                              size="small"
                              onClick={() => handlePrintBarcodeClick(med)}
                              sx={{
                                backgroundColor: "#8B5CF6",
                                color: "white",
                                p: 0.5,
                                "&:hover": { backgroundColor: "#7C3AED" },
                              }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredMedicines.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 4, color: "text.secondary" }}
                    >
                      No medicines found in master inventory database.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={filteredMedicines.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </TableContainer>
        </Box>
      )}

      {/* Tab 1: Medicine Entry Form (Categorized Sections) */}
      {tabIndex === 1 && (
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            backgroundColor: "#fff",
          }}
        >
          {/* Section 1: Basic Details */}
          <SectionHeader
            icon={<MedicationIcon />}
            title="Basic Details"
            subtitle="Medicine name, manufacturer, unit and category"
          />
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Medicine Name"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Generic Name"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Manufacturer"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="ANTIBIOTIC">ANTIBIOTIC</MenuItem>
                <MenuItem value="PAIN KILLER">PAIN KILLER</MenuItem>
                <MenuItem value="INJECTION">INJECTION</MenuItem>
                <MenuItem value="SYRUP">SYRUP</MenuItem>
                <MenuItem value="VITAMIN">VITAMIN</MenuItem>
                <MenuItem value="TABLET">TABLET</MenuItem>
                <MenuItem value="CAPSULE">CAPSULE</MenuItem>
                <MenuItem value="CREAM">CREAM</MenuItem>
                <MenuItem value="OTHER">OTHER</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Dosage Type"
                value={dosageType}
                onChange={(e) => setDosageType(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="TABLET">TABLET</MenuItem>
                <MenuItem value="CAPSULE">CAPSULE</MenuItem>
                <MenuItem value="SYRUP">SYRUP</MenuItem>
                <MenuItem value="INJECTION">INJECTION</MenuItem>
                <MenuItem value="OINTMENT">OINTMENT</MenuItem>
                <MenuItem value="SUSPENSION">SUSPENSION</MenuItem>
                <MenuItem value="POWDER">POWDER</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="TABLET">TABLET</MenuItem>
                <MenuItem value="STRIP">STRIP</MenuItem>
                <MenuItem value="BOTTLE">BOTTLE</MenuItem>
                <MenuItem value="VIAL">VIAL</MenuItem>
                <MenuItem value="VIAL">AMPOULE</MenuItem>
                <MenuItem value="INJECTION">INJECTION</MenuItem>
                <MenuItem value="TUBE">TUBE</MenuItem>
                <MenuItem value="PACK">PACK</MenuItem>
                <MenuItem value="BOX">BOX</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Discontinued">Discontinued</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Section 2: Batch & Logistics */}
          <SectionHeader
            icon={<InventoryIcon />}
            title="Batch & Logistics Details"
            subtitle="Batch number, expiry dates, supplier and barcode"
          />
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Batch No"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                select
                size="small"
                label="Supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                sx={fieldSx}
              >
                {suppliers.map((s) => (
                  <MenuItem key={s.id} value={s.supplierName}>
                    {s.supplierName}
                  </MenuItem>
                ))}
                {suppliers.length === 0 && (
                  <MenuItem value="ABC Pharma">ABC Pharma (Default)</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Manufacturing Date"
                type="date"
                value={manufacturingDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setManufacturingDate(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                required
                size="small"
                label="Expiry Date"
                type="date"
                value={expiryDate}
                slotProps={{ inputLabel: { shrink: true } }}
                onChange={(e) => setExpiryDate(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                disabled
                size="small"
                label="Item Code (Auto-generated)"
                value={editId ? itemCode : "[Auto-Generated on Save]"}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          {/* Section 3: Cost & Pricing */}
          <SectionHeader
            icon={<PaymentsIcon />}
            title="Cost & Pricing (₹)"
            subtitle="Purchase rate, MRP, selling price and taxation (GST)"
          />
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Purchase Price (₹)"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="MRP (₹)"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Selling Price (₹)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="GST %"
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                sx={fieldSx}
              >
                <MenuItem value={0}>0%</MenuItem>
                <MenuItem value={5}>5%</MenuItem>
                <MenuItem value={12}>12%</MenuItem>
                <MenuItem value={18}>18%</MenuItem>
                <MenuItem value={28}>28%</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Section 4: Stock & Storage */}
          <SectionHeader
            icon={<MedicalInformationIcon />}
            title="Stock & Storage"
            subtitle="Quantity, minimum stock level, reorder level and rack location"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Stock Qty"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                required
                type="number"
                size="small"
                label="Minimum Stock"
                value={minimumStockLevel}
                onChange={(e) => setMinimumStockLevel(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="number"
                size="small"
                label="Reorder Level"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="HSN Code"
                value={hsnCode}
                onChange={(e) => setHsnCode(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Rack Location (e.g. Rack A-12, Shelf 4)"
                value={rackLocation}
                onChange={(e) => setRackLocation(e.target.value.toUpperCase())}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Box
            sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={editId ? <EditIcon /> : <AddCircleIcon />}
              sx={{
                height: 40,
                px: 3,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 750,
                fontSize: "0.9rem",
                background: editId
                  ? "linear-gradient(135deg, #06B6D4, #0891B2)"
                  : "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1E40AF, #06B6D4)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {editId ? "Update Medicine" : "Save Medicine"}
            </Button>

            <Button
              variant="outlined"
              onClick={resetForm}
              startIcon={<ClearIcon />}
              sx={{
                height: 40,
                px: 2,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 750,
                color: "#64748B",
                borderColor: "#CBD5E1",
                "&:hover": {
                  backgroundColor: "#F1F5F9",
                  borderColor: "#94A3B8",
                },
              }}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      )}

      {/* Barcode Print Dialog */}
      <Dialog
        open={barcodePrintOpen}
        onClose={() => setBarcodePrintOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Print Medicine Barcode
        </DialogTitle>
        <DialogContent dividers>
          <div id="barcode-print-area">
            <Box sx={{ p: 2, textAlign: "center", bgcolor: "#fff" }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 0.5 }}
              >
                {printMedicineName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                MRP: ₹{Number(printMrp).toFixed(2)}
              </Typography>
              <BarcodeRenderer value={printBarcodeValue} />
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBarcodePrintOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrintBarcodeTrigger}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}