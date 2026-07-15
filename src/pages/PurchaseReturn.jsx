import React, { useEffect, useState } from "react";
import api from "../services/api";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Divider,
  Autocomplete,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  TablePagination,
  Tooltip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { getMedicineLabel } from "../utils/medicineFormatter";
import * as XLSX from "xlsx";

const API = "/api";

export default function PurchaseReturn() {
  const [suppliers, setSuppliers] = useState([]);
  const [grns, setGrns] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [items, setItems] = useState([]);

  // Tabs state
  const [tab, setTab] = useState(0); // 0 = Purchase Return Form, 1 = Return List
  const [returnsList, setReturnsList] = useState([]);
  const [returnsSearch, setReturnsSearch] = useState("");
  const [returnsPage, setReturnsPage] = useState(0);
  const [returnsRowsPerPage, setReturnsRowsPerPage] = useState(10);

  // Detail Dialog State
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedReturnItems, setSelectedReturnItems] = useState([]);
  
  // Edit State
  const [editReturnId, setEditReturnId] = useState(null);

  const [formData, setFormData] = useState({
    returnNumber: "",
    returnDate: new Date().toISOString().split("T")[0],
    supplierId: "",
    supplierName: "",
    grnNumber: "",
    remarks: "",
  });

  const loadSuppliers = async () => {
    try {
      const res = await api.get(`${API}/suppliers`);
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadGRNs = async () => {
    try {
      const res = await api.get(`${API}/pharmacy-purchase`);
      setGrns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await api.get(`${API}/medicines`);
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReturns = async () => {
    try {
      const res = await api.get(`${API}/purchase-returns`);
      setReturnsList(res.data || []);
    } catch (err) {
      console.error("Failed to load purchase returns:", err);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadGRNs();
    loadMedicines();
    loadReturns();

    setFormData((prev) => ({
      ...prev,
      returnNumber: generateReturnNumber(),
    }));
  }, []);

  const generateReturnNumber = () => {
    return (
      "PR" + new Date().getFullYear() + Math.floor(1000 + Math.random() * 9000)
    );
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        medicineId: "",
        medicineName: "",
        batchNo: "",
        returnQty: 1,
        purchaseRate: 0,
        amount: 0,
      },
    ]);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    const qty = Number(updated[index].returnQty || 0);
    const rate = Number(updated[index].purchaseRate || 0);
    updated[index].amount = qty * rate;
    setItems(updated);
  };

  const selectMedicine = (index, medicine) => {
    const updated = [...items];
    if (medicine) {
      updated[index].medicineId = medicine.id || "";
      updated[index].medicineName = medicine.medicineName || "";
      updated[index].batchNo = medicine.batchNo || "";
      updated[index].purchaseRate = Number(medicine.purchasePrice || 0);
      updated[index].amount = Number(updated[index].returnQty || 0) * Number(medicine.purchasePrice || 0);
    } else {
      updated[index].medicineId = "";
      updated[index].medicineName = "";
      updated[index].batchNo = "";
      updated[index].purchaseRate = 0;
      updated[index].amount = 0;
    }
    setItems(updated);
  };

  const handleGrnChange = async (grnNo) => {
    const selectedGrn = grns.find((g) => g.grnNumber === grnNo);
    if (!selectedGrn) {
      setFormData((prev) => ({
        ...prev,
        grnNumber: "",
        supplierId: "",
        supplierName: "",
      }));
      setItems([]);
      return;
    }

    const matchedSupplier = suppliers.find(
      (s) => s.supplierName?.trim().toUpperCase() === selectedGrn.supplierName?.trim().toUpperCase()
    );

    setFormData((prev) => ({
      ...prev,
      grnNumber: grnNo,
      supplierId: matchedSupplier ? matchedSupplier.id : (selectedGrn.supplierId || ""),
      supplierName: selectedGrn.supplierName || "",
    }));

    try {
      const res = await api.get(`${API}/pharmacy-purchase/${selectedGrn.id}/items`);
      const purchaseItems = res.data || [];
      const returnItems = purchaseItems.map((it) => ({
        medicineId: it.medicineId || "",
        medicineName: it.medicineName || "",
        batchNo: it.batchNo || "",
        returnQty: 1,
        purchaseRate: Number(it.purchaseRate || 0),
        amount: Number(it.purchaseRate || 0),
      }));
      setItems(returnItems);
    } catch (err) {
      console.error("Failed to load GRN items:", err);
      setItems([]);
    }
  };

  const viewReturnDetails = async (ret) => {
    try {
      const res = await api.get(`${API}/purchase-returns/${ret.id}/items`);
      setSelectedReturn(ret);
      setSelectedReturnItems(res.data || []);
      setDetailOpen(true);
    } catch (err) {
      console.error("Failed to load return items:", err);
      alert("Failed to load return details");
    }
  };

  const handleEditReturn = async (ret) => {
    try {
      const res = await api.get(`${API}/purchase-returns/${ret.id}/items`);
      const returnItems = (res.data || []).map((it) => ({
        medicineId: it.medicineId || "",
        medicineName: it.medicineName || "",
        batchNo: it.batchNo || "",
        returnQty: it.returnQty || 0,
        purchaseRate: Number(it.purchaseRate || 0),
        amount: Number(it.amount || 0),
      }));

      const matchedSupplier = suppliers.find(
        (s) => s.supplierName?.trim().toUpperCase() === ret.supplierName?.trim().toUpperCase()
      );

      setFormData({
        returnNumber: ret.returnNumber || "",
        returnDate: ret.returnDate || new Date().toISOString().split("T")[0],
        supplierId: matchedSupplier ? matchedSupplier.id : (ret.supplierId || ""),
        supplierName: ret.supplierName || "",
        grnNumber: ret.grnNumber || "",
        remarks: ret.remarks || "",
      });

      setItems(returnItems);
      setEditReturnId(ret.id);
      setTab(0);
    } catch (err) {
      console.error("Failed to load return details for editing:", err);
      alert("Failed to edit return");
    }
  };

  const handleDeleteReturn = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase return?")) {
      return;
    }
    try {
      await api.delete(`${API}/purchase-returns/${id}`);
      alert("Purchase Return Deleted Successfully");
      loadReturns();
    } catch (err) {
      console.error("Failed to delete purchase return:", err);
      alert("Delete Failed");
    }
  };

  const exportReturnsToExcel = () => {
    const excelData = filteredReturns.map((r, index) => ({
      "SI No": index + 1,
      "Return No": r.returnNumber || "",
      "Date": r.returnDate || "",
      "Supplier": r.supplierName || "",
      "GRN Number": r.grnNumber || "",
      "Total Amount": r.totalAmount || 0,
      "Remarks": r.remarks || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Returns");
    XLSX.writeFile(workbook, "Purchase_Returns_List.xlsx");
  };

  const exportReturnItemsToExcel = (ret, retItems) => {
    const excelData = retItems.map((item, index) => ({
      "SI No": index + 1,
      "Medicine Name": item.medicineName || "",
      "Batch No": item.batchNo || "",
      "Return Qty": item.returnQty || 0,
      "Purchase Rate": item.purchaseRate || 0,
      "Amount": item.amount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Return Items");
    XLSX.writeFile(workbook, `Return_Items_${ret.returnNumber}.xlsx`);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const savePurchaseReturn = async () => {
    try {
      if (editReturnId) {
        await api.put(`${API}/purchase-returns/${editReturnId}`, {
          ...formData,
          totalAmount,
          items,
        });
        alert("Purchase Return Updated Successfully");
      } else {
        await api.post(`${API}/purchase-returns`, {
          ...formData,
          totalAmount,
          items,
        });
        alert("Purchase Return Saved Successfully");
      }

      loadReturns();
      clearForm();
      setTab(1); // Switch to list tab to see the saved entry
    } catch (err) {
      console.error(err);
      alert("Save Failed");
    }
  };

  const totalItems = items.length;

  const totalQty = items.reduce(
    (sum, item) => sum + Number(item.returnQty || 0),
    0,
  );

  const clearForm = () => {
    setFormData({
      returnNumber: generateReturnNumber(),
      returnDate: new Date().toISOString().split("T")[0],
      supplierId: "",
      supplierName: "",
      grnNumber: "",
      remarks: "",
    });
    setItems([]);
    setEditReturnId(null);
  };

  // Filter returns
  const filteredReturns = returnsList.filter((r) => {
    const searchVal = returnsSearch.toLowerCase();
    return (
      (r.returnNumber || "").toLowerCase().includes(searchVal) ||
      (r.supplierName || "").toLowerCase().includes(searchVal) ||
      (r.grnNumber || "").toLowerCase().includes(searchVal)
    );
  });

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700}>
          Purchase Return
        </Typography>
      </Paper>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)}>
          <Tab label="Purchase Return Form" sx={{ textTransform: "none", fontWeight: 700 }} />
          <Tab label="Return List" sx={{ textTransform: "none", fontWeight: 700 }} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <>
          <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Return No"
                  value={formData.returnNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      returnNumber: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Return Date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      returnDate: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="Supplier"
                  value={formData.supplierId}
                  onChange={(e) => {
                    const supplier = suppliers.find(
                      (s) => s.id == e.target.value,
                    );

                    setFormData({
                      ...formData,
                      supplierId: supplier.id,
                      supplierName: supplier.supplierName,
                    });
                  }}
                >
                  {suppliers.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.supplierName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  fullWidth
                  label="GRN Number"
                  value={formData.grnNumber}
                  onChange={(e) => handleGrnChange(e.target.value)}
                >
                  {grns.map((g) => (
                    <MenuItem key={g.id} value={g.grnNumber}>
                      {g.grnNumber}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      remarks: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Return Items
              </Typography>

              <Button startIcon={<AddCircleIcon />} onClick={addRow}>
                Add Item
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(90deg,#1E40AF,#2563EB)",
                    }}
                  >
                    {["SI No", "Medicine", "Batch No", "Return Qty", "Purchase Rate", "Amount", "Action"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell sx={{ minWidth: 250 }}>
                        <Autocomplete
                          options={medicines}
                          getOptionLabel={(option) => {
                            const code = option.itemCode
                              ? `[${option.itemCode}] `
                              : "";
                            const batch = option.batchNo ? ` (Batch: ${option.batchNo})` : "";
                            return `${code}${getMedicineLabel(option) || option.medicineName || ""}${batch}`;
                          }}
                          value={
                            medicines.find(
                              (m) => String(m.id) === String(item.medicineId)
                            ) ||
                            (item.medicineName
                              ? { medicineName: item.medicineName, batchNo: item.batchNo }
                              : null)
                          }
                          onChange={(event, value) => selectMedicine(index, value)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Search Medicine"
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 180 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={item.batchNo}
                          onChange={(e) =>
                            handleItemChange(index, "batchNo", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 130 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.returnQty}
                          onChange={(e) =>
                            handleItemChange(index, "returnQty", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={item.purchaseRate}
                          onChange={(e) =>
                            handleItemChange(index, "purchaseRate", e.target.value)
                          }
                        />
                      </TableCell>

                      <TableCell sx={{ minWidth: 150 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={Number(item.amount || 0).toFixed(2)}
                          InputProps={{
                            readOnly: true,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <IconButton color="error" onClick={() => removeRow(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 4,
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Return Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    background: "linear-gradient(135deg,#1E40AF,#2563EB)",
                    color: "#fff",
                  }}
                >
                  <Typography>Total Items</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalItems}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    background: "linear-gradient(135deg,#059669,#10B981)",
                    color: "#fff",
                  }}
                >
                  <Typography>Total Qty</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {totalQty}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    textAlign: "center",
                    borderRadius: 3,
                    background: "linear-gradient(135deg,#EA580C,#F97316)",
                    color: "#fff",
                  }}
                >
                  <Typography>Total Amount</Typography>
                  <Typography variant="h4" fontWeight={700}>
                    ₹ {totalAmount.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 4,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={savePurchaseReturn}
                sx={{
                  background: "linear-gradient(135deg,#1E40AF,#2563EB)",
                  minWidth: 180,
                  height: 50,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Save Return
              </Button>

              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={clearForm}
                sx={{
                  minWidth: 180,
                  height: 50,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Clear
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={2} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search return number, supplier, GRN..."
              value={returnsSearch}
              onChange={(e) => setReturnsSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
              }}
              sx={{ width: 320 }}
            />
            <Button
              variant="contained"
              color="success"
              startIcon={<FileDownloadIcon />}
              onClick={exportReturnsToExcel}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Export Excel
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: "linear-gradient(90deg,#1E40AF,#2563EB)" }}>
                  {["SI No", "Return No", "Date", "Supplier", "GRN Number", "Total Amount", "Remarks", "Actions"].map((h) => (
                    <TableCell key={h} sx={{ color: "#fff", fontWeight: 700 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReturns
                  .slice(returnsPage * returnsRowsPerPage, returnsPage * returnsRowsPerPage + returnsRowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{returnsPage * returnsRowsPerPage + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.returnNumber}</TableCell>
                      <TableCell>{row.returnDate}</TableCell>
                      <TableCell>{row.supplierName}</TableCell>
                      <TableCell>{row.grnNumber}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>₹{Number(row.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell>{row.remarks || "-"}</TableCell>
                      <TableCell>
                        <Tooltip title="View Items">
                          <IconButton color="primary" onClick={() => viewReturnDetails(row)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Return">
                          <IconButton color="warning" onClick={() => handleEditReturn(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Return">
                          <IconButton color="error" onClick={() => handleDeleteReturn(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredReturns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No purchase returns found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredReturns.length}
            page={returnsPage}
            onPageChange={(e, p) => setReturnsPage(p)}
            rowsPerPage={returnsRowsPerPage}
            onRowsPerPageChange={(e) => {
              setReturnsRowsPerPage(parseInt(e.target.value, 10));
              setReturnsPage(0);
            }}
          />
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={700}>
            Return Details - {selectedReturn?.returnNumber}
          </Typography>
          {selectedReturn && (
            <Button
              variant="outlined"
              color="success"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={() => exportReturnItemsToExcel(selectedReturn, selectedReturnItems)}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Export Items
            </Button>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedReturn && (
            <Box mb={3} sx={{ bgcolor: "#F8FAFC", p: 2, borderRadius: 2, border: "1px solid #E2E8F0" }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>SUPPLIER</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{selectedReturn.supplierName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>GRN NUMBER</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{selectedReturn.grnNumber}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>RETURN DATE</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{selectedReturn.returnDate}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>TOTAL AMOUNT</Typography>
                  <Typography variant="body1" fontWeight={750} color="primary.main">₹{Number(selectedReturn.totalAmount || 0).toFixed(2)}</Typography>
                </Grid>
                {selectedReturn.remarks && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>REMARKS</Typography>
                    <Typography variant="body2" color="#334155">{selectedReturn.remarks}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
            Items Returned
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>SI No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Medicine</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Batch No</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Return Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Purchase Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedReturnItems.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.medicineName}</TableCell>
                    <TableCell>{item.batchNo || "-"}</TableCell>
                    <TableCell align="right">{item.returnQty}</TableCell>
                    <TableCell align="right">₹{Number(item.purchaseRate || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>₹{Number(item.amount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
