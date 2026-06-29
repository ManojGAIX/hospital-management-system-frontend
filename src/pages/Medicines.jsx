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
} from "@mui/material";

// Icons
import MedicationIcon from "@mui/icons-material/Medication";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";

import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../api/medicineApi";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);

  // Form State
  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [dosageType, setDosageType] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [batchNo, setBatchNo] = useState("");

  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const filteredMedicines = medicines.filter((p) => {
    const medicineName = p.medicineName?.toLowerCase() || "";

    const searchText = search.toLowerCase();

    return (
      medicineName.includes(searchText) ||
      String(p.medicineName).includes(searchText)
    );
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const res = await getMedicines();
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!medicineName || !price || !dosageType) {
      alert("Please fill in Medicine Name, Price, and Dosage Type");
      return;
    }

    const payload = {
      medicineName: medicineName.toUpperCase(),
      manufacturer: manufacturer.toUpperCase(),
      batchNo: batchNo.toUpperCase(),
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      dosageType: dosageType.toUpperCase(),
      expiryDate: expiryDate || null,
    };

    try {
      if (editId) {
        await updateMedicine(editId, payload);
        alert("Medicine inventory updated successfully!");
      } else {
        await createMedicine(payload);
        alert("New medicine added to stock!");
      }
      resetForm();
      loadMedicines();
    } catch (err) {
      console.error(err);
      alert("Failed to save medicine data.");
    }
  };

  const handleEdit = (med) => {
    setEditId(med.id);
    setMedicineName(med.medicineName);
    setManufacturer(med.manufacturer);
    setBatchNo(med.batchNo || "");
    setPrice(med.price);
    setStockQuantity(med.stockQuantity);
    setDosageType(med.dosageType);
    setExpiryDate(med.expiryDate || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to remove this medicine from stock?",
      )
    ) {
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
    setMedicineName("");
    setManufacturer("");
    setBatchNo("");
    setPrice("");
    setStockQuantity("");
    setDosageType("");
    setExpiryDate("");
  };

  return (
    <Box
      sx={{ padding: "6px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
    >
      {/* Header Section */}
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
          {editId ? "Update Medicine Details" : "Pharmacy Inventory"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage hospital medicine stock and pricing
        </Typography>
      </Box> */}

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
            gap: "22px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            label="Medicine Name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value.toUpperCase())}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <TextField
            label="Manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value.toUpperCase())}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <TextField
            label="Batch No"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value.toUpperCase())}
            sx={{ flex: 1, minWidth: "180px" }}
          />

          <TextField
            label="Price (₹)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            sx={{ flex: 0.5, minWidth: "120px" }}
          />

          <TextField
            label="Stock Qty"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            sx={{ flex: 0.5, minWidth: "120px" }}
          />

          <FormControl sx={{ flex: 1, minWidth: "180px" }}>
            <InputLabel>Dosage Type</InputLabel>
            <Select
              value={dosageType}
              label="Dosage Type"
              onChange={(e) => setDosageType(e.target.value)}
            >
              <MenuItem value="TABLET">TABLET</MenuItem>
              <MenuItem value="CAPSULE">CAPSULE</MenuItem>
              <MenuItem value="SYRUP">SYRUP</MenuItem>
              <MenuItem value="INJECTION">INJECTION</MenuItem>
              <MenuItem value="OINTMENT">OINTMENT</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Expiry Date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
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

          <Box
            sx={{
              display: "flex",
              gap: 2,
              ml: "auto",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={editId ? <EditIcon /> : <AddCircleIcon />}
              sx={{
                height: 55,
                px: 4,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,

                background: editId
                  ? "linear-gradient(135deg, #06B6D4, #0891B2)"
                  : "linear-gradient(135deg, #10B981, #059669)",

                boxShadow: editId
                  ? "0 8px 24px rgba(6,182,212,0.25)"
                  : "0 8px 24px rgba(16,185,129,0.25)",

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
              {editId ? "Update" : "Add to Stock"}
            </Button>

            {editId && (
              <Button
                variant="outlined"
                onClick={resetForm}
                sx={{
                  height: 55,
                  px: 3,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,

                  color: "#EF4444",
                  borderColor: "#EF4444",

                  transition: "all 0.3s ease",

                  "&:hover": {
                    backgroundColor: "#FEF2F2",
                    borderColor: "#DC2626",
                    color: "#DC2626",

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <InventoryIcon sx={{ color: "#1e3a8a" }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#1e3a8a" }}
          >
            Current Inventory
          </Typography>
        </Box>
        {/* SEARCH + FILTER */}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search by Medicine Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
        </Box>
      </Box>
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
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                ID
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                MEDICINE NAME
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                COMPANY
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                BATCH NO
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                PRICE (₹)
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                STOCK
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                DOSAGE
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                EXPIRY DATE
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: "#fff" }}
                align="center"
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMedicines
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((med, index) => (
                <TableRow
                  key={med.id}
                  hover
                  sx={{ "&:nth-of-type(even)": { backgroundColor: "#f8faff" } }}
                >
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                    {`MED-${String(med.id).padStart(3, "0")}`}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {med.medicineName}
                  </TableCell>
                  <TableCell>{med.manufacturer}</TableCell>
                  <TableCell>{med.batchNo}</TableCell>
                  <TableCell>₹{med.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={med.stockQuantity}
                      color={med.stockQuantity < 10 ? "error" : "success"}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={med.dosageType}
                      size="small"
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#e0f2fe",
                        color: "#0369a1",
                      }}
                    />
                  </TableCell>
                  <TableCell>{med.expiryDate || "N/A"}</TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Tooltip title="Edit Medicine">
                        <IconButton
                          size="small" // ACTION: Shrinks the action layout container
                          onClick={() => handleEdit(med)}
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
                          {/* ACTION: Scales down the vector icon dimensions */}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Medicine">
                        <IconButton
                          size="small" // ACTION: Matched identical compact container dimensions
                          onClick={() => handleDelete(med.id)}
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
            {medicines.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No medicines found in stock.
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
  );
}
