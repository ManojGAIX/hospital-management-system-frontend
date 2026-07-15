import React, { useEffect, useState } from "react";

import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TablePagination,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { getMedicineLabel } from "../utils/medicineFormatter";

export default function PurchaseRegister({ onEdit, refreshKey }) {
  const API = "/api";

  const [purchases, setPurchases] = useState([]);

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [open, setOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [editPurchase, setEditPurchase] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  const loadPurchases = async () => {
    try {
      const res = await api.get(`${API}/pharmacy-purchase`);

      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPurchases();
    // reload when parent signals
  }, [refreshKey]);

  const filtered = purchases.filter((p) => {
    const matchesSearch = [p.grnNumber, p.supplierName, p.billNumber]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesSupplier =
      !supplierFilter || p.supplierName === supplierFilter;

    const billDate = p.billDate || "";

    const matchesDate =
      (!fromDate || billDate >= fromDate) && (!toDate || billDate <= toDate);

    return matchesSearch && matchesDate && matchesSupplier;
  });

  const viewItems = async (purchaseId) => {
    try {
      const res = await api.get(`${API}/pharmacy-purchase/${purchaseId}/items`);

      setItems(res.data);

      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (purchase) => {
    setEditPurchase({
      id: purchase.id,
      grnNumber: purchase.grnNumber,
      supplierName: purchase.supplierName || "",
      billNumber: purchase.billNumber || "",
      billDate: purchase.billDate || "",
      finalAmount: purchase.finalAmount || 0,
    });

    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editPurchase) return;

    try {
      await api.put(`${API}/pharmacy-purchase/${editPurchase.id}`, editPurchase);

      setEditOpen(false);

      setEditPurchase(null);

      loadPurchases();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteGRN = async (id) => {
    if (!window.confirm("Delete GRN ?")) {
      return;
    }

    try {
      await api.delete(`${API}/pharmacy-purchase/${id}`);

      loadPurchases();
    } catch (err) {
      console.error(err);
    }
  };

  const printGRN = async (purchase) => {
    try {
      const res = await api.get(
        `${API}/pharmacy-purchase/${purchase.id}/items`,
      );

      const items = res.data;

      const doc = new jsPDF();

      doc.setFontSize(18);

      doc.text("GOODS RECEIPT NOTE", 60, 15);

      doc.setFontSize(11);

      doc.text(`GRN No : ${purchase.grnNumber}`, 14, 30);

      doc.text(`Supplier : ${purchase.supplierName}`, 14, 38);

      autoTable(doc, {
        startY: 50,

        head: [["Medicine", "Batch", "Qty", "Rate", "Amount"]],

        body: items.map((i) => [
          getMedicineLabel(i) || i.medicineName,
          i.batchNo,
          i.quantity,
          i.purchaseRate,
          i.amount,
        ]),
      });

      doc.save(`${purchase.grnNumber}.pdf`);
    } catch (err) {
      console.error(err);
    }
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtered);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Register");

    XLSX.writeFile(workbook, "PurchaseRegister.xlsx");
  };

  return (
    <Box p={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,

          borderRadius: "24px",

          background:
            "linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #06B6D4 100%)",

          color: "#fff",

          boxShadow: "0 15px 35px rgba(30,64,175,0.20)",

          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Chip
            icon={<ReceiptLongIcon />}
            label={`Total GRNs: ${filtered.length} `}
            sx={{
              height: 42,

              background: "rgba(255,255,255,0.15)",

              backdropFilter: "blur(10px)",

              color: "#fff",

              border: "1px solid rgba(255,255,255,0.20)",

              fontWeight: 700,

              "& .MuiChip-icon": {
                color: "#BFDBFE",
              },
            }}
          />

          <Chip
            icon={<ReceiptLongIcon />}
            label={`Purchase Value: ${filtered
              .reduce((sum, p) => sum + Number(p.finalAmount || 0), 0)
              .toFixed(2)} `}
            sx={{
              height: 42,

              background: "rgba(255,255,255,0.15)",

              backdropFilter: "blur(10px)",

              color: "#fff",

              border: "1px solid rgba(255,255,255,0.20)",

              fontWeight: 700,

              "& .MuiChip-icon": {
                color: "#BFDBFE",
              },
            }}
          />

          <Chip
            icon={<ReceiptLongIcon />}
            label={`Today's Purchases: ${filtered
              .filter((p) => {
                const today = new Date().toISOString().split("T")[0];

                return p.billDate === today;
              })
              .reduce((sum, p) => sum + Number(p.finalAmount || 0), 0)
              .toFixed(2)} `}
            sx={{
              height: 42,

              background: "rgba(255,255,255,0.15)",

              backdropFilter: "blur(10px)",

              color: "#fff",

              border: "1px solid rgba(255,255,255,0.20)",

              fontWeight: 700,

              "& .MuiChip-icon": {
                color: "#BFDBFE",
              },
            }}
          />
        </Box>
      </Paper>

      <TextField
        fullWidth
        label="Search GRN / Supplier / Bill No"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />

        <TextField
          select
          label="Supplier"
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">All Suppliers</MenuItem>

          {[...new Set(purchases.map((p) => p.supplierName))].map(
            (supplier) => (
              <MenuItem key={supplier} value={supplier}>
                {supplier}
              </MenuItem>
            ),
          )}
        </TextField>

        <Button variant="contained" onClick={exportExcel}>
          Export Excel
        </Button>
      </Box>

      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(90deg,#1E40AF,#2563EB)",
                }}
              >
                {[
                  "SI No",
                  "GRN No",
                  "Supplier",
                  "Bill No",
                  "Bill Date",
                  "Amount",
                  "Actions",
                ].map((h) => (
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
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>{row.grnNumber}</TableCell>

                    <TableCell>{row.supplierName}</TableCell>

                    <TableCell>{row.billNumber}</TableCell>

                    <TableCell>{row.billDate}</TableCell>

                    <TableCell>
                      ₹ {Number(row.finalAmount || 0).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => viewItems(row.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>

                      <IconButton color="success" onClick={() => printGRN(row)}>
                        <PrintIcon />
                      </IconButton>

                      <IconButton
                        color="info"
                        onClick={() => (onEdit ? onEdit(row) : openEdit(row))}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => deleteGRN(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filtered.length}
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#1E40AF",
          }}
        >
          GRN Item Details
        </DialogTitle>

        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>

                  <TableCell>Batch No</TableCell>

                  <TableCell>Expiry</TableCell>

                  <TableCell>Qty</TableCell>

                  <TableCell>Free Qty</TableCell>

                  <TableCell>Purchase Rate</TableCell>

                  <TableCell>MRP</TableCell>

                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getMedicineLabel(item) || item.medicineName}</TableCell>

                    <TableCell>{item.batchNo}</TableCell>

                    <TableCell>{item.expiryDate}</TableCell>

                    <TableCell>{item.quantity}</TableCell>

                    <TableCell>{item.freeQuantity}</TableCell>

                    <TableCell>₹ {item.purchaseRate}</TableCell>

                    <TableCell>₹ {item.mrp}</TableCell>

                    <TableCell>₹ {item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#1E40AF" }}>Edit GRN</DialogTitle>

        <DialogContent>
          {editPurchase && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField label="GRN No" value={editPurchase.grnNumber} disabled />

              <TextField
                label="Supplier"
                value={editPurchase.supplierName}
                onChange={(e) => setEditPurchase({ ...editPurchase, supplierName: e.target.value })}
              />

              <TextField
                label="Bill No"
                value={editPurchase.billNumber}
                onChange={(e) => setEditPurchase({ ...editPurchase, billNumber: e.target.value })}
              />

              <TextField
                label="Bill Date"
                type="date"
                value={editPurchase.billDate}
                onChange={(e) => setEditPurchase({ ...editPurchase, billDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Final Amount"
                type="number"
                value={editPurchase.finalAmount}
                onChange={(e) => setEditPurchase({ ...editPurchase, finalAmount: e.target.value })}
              />

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 1 }}>
                <Button onClick={() => { setEditOpen(false); setEditPurchase(null); }}>Cancel</Button>

                <Button variant="contained" onClick={saveEdit}>Save</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
