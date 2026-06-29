import React, { useEffect, useState } from "react";

import axios from "axios";

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
  TablePagination,
  Chip,
  Button,
} from "@mui/material";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CurrentStockRegister() {
  const API = "http://localhost:8080/api";

  const [stocks, setStocks] = useState([]);

  const [search, setSearch] = useState("");

  const loadStock = async () => {
    try {
      const res = await axios.get(`${API}/stock`);

      setStocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const filtered = stocks.filter((s) =>
    [s.medicineName, s.batchNo]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedData = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const exportExcel = () => {
    const excelData = filtered.map((item) => ({
      Medicine: item.medicineName,
      Batch: item.batchNo,
      Expiry: item.expiryDate,
      StockQty: item.stockQty,
      PurchaseRate: item.purchaseRate,
      MRP: item.mrp,
      StockValue: item.stockValue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Stock");

    XLSX.writeFile(workbook, "CurrentStockRegister.xlsx");
  };

  const nearExpiryExcel = () => {
    const excelData = filtered
      .filter((item) => {
        const exp = new Date(item.expiryDate);

        const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);

        return diff > 0 && diff <= 90;
      })
      .map((item) => ({
        Medicine: item.medicineName,
        Batch: item.batchNo,
        Expiry: item.expiryDate,
        StockQty: item.stockQty,
        PurchaseRate: item.purchaseRate,
        MRP: item.mrp,
        StockValue: item.stockValue,
      }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Stock");

    XLSX.writeFile(workbook, "NearExpiryItemsReport.xlsx");
  };

  const printStockReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("CURRENT STOCK REGISTER", 55, 15);

    autoTable(doc, {
      startY: 25,

      head: [["Medicine", "Batch", "Expiry", "Qty", "MRP", "Value"]],

      body: filtered.map((item) => [
        item.medicineName,
        item.batchNo,
        item.expiryDate,
        item.stockQty,
        item.mrp,
        item.stockValue,
      ]),
    });

    doc.save("CurrentStock.pdf");
  };

  const expiredCount = filtered.filter((item) => {
    const exp = new Date(item.expiryDate);

    return exp < new Date();
  }).length;

  const nearExpiryCount = filtered.filter((item) => {
    const exp = new Date(item.expiryDate);

    const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);

    return diff > 0 && diff <= 90;
  }).length;

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
        <Typography variant="h5" fontWeight={700}>
          Current Stock Register
        </Typography>

        <Typography>Available Pharmacy Inventory</Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">Total Medicines</Typography>

          <Typography variant="h5" fontWeight={700}>
            {filtered.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">Total Stock Qty</Typography>

          <Typography variant="h5" fontWeight={700} color="primary">
            {filtered.reduce((sum, s) => sum + Number(s.stockQty || 0), 0)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">Inventory Value</Typography>

          <Typography variant="h5" fontWeight={700} color="success.main">
            ₹
            {filtered
              .reduce((sum, s) => sum + Number(s.stockValue || 0), 0)
              .toFixed(2)}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">Low Stock Items</Typography>

          <Typography variant="h5" fontWeight={700} color="error">
            {filtered.filter((s) => s.stockQty < 10).length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography color="error">Expired Medicines</Typography>

          <Typography variant="h4" fontWeight={700}>
            {expiredCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography color="warning.main">Near Expiry</Typography>

          <Typography variant="h4" fontWeight={700}>
            {nearExpiryCount}
          </Typography>
        </Paper>
      </Box>

      <TextField
        fullWidth
        label="Search Medicine"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
        }}
      >
        <Button variant="contained" onClick={exportExcel}>
          Export Excel
        </Button>

        <Button variant="contained" color="success" onClick={printStockReport}>
          Print PDF
        </Button>
      </Box>

      <Paper>
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
                  "Medicine",
                  "Batch",
                  "Expiry",
                  "Stock Qty",
                  "Purchase",
                  "MRP",
                  "Stock Value",
                  "Status",
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
              {paginatedData.map((row, index) => {
                const expiryDate = new Date(row.expiryDate);

                const today = new Date();

                const diffDays = Math.ceil(
                  (expiryDate - today) / (1000 * 60 * 60 * 24),
                );

                let status = "Available";
                let color = "success";

                if (diffDays <= 30) {
                  status = "Expiring";
                  color = "warning";
                }

                if (diffDays <= 0) {
                  status = "Expired";
                  color = "error";
                }

                if (row.stockQty < 10) {
                  status = "Low Stock";
                  color = "error";
                }
                return (
                  <TableRow key={index}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{row.medicineName}</TableCell>
                    <TableCell>{row.batchNo}</TableCell>
                    <TableCell>{row.expiryDate}</TableCell>
                    <TableCell>{row.stockQty}</TableCell>
                    <TableCell>
                      ₹{Number(row.purchaseRate).toFixed(2)}
                    </TableCell>
                    <TableCell>₹{Number(row.mrp).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(row.stockValue).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={status} color={color} size="small" />
                    </TableCell>
                  </TableRow>
                );
              })}
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

      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2} color="error">
            Near Expiry Medicines
          </Typography>

          <Button variant="contained" onClick={nearExpiryExcel}>
            Near Expiry Excel
          </Button>
        </div>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Expiry</TableCell>
              <TableCell>Qty</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered
              .filter((item) => {
                const exp = new Date(item.expiryDate);

                const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);

                return diff > 0 && diff <= 90;
              })
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.medicineName}</TableCell>

                  <TableCell>{item.batchNo}</TableCell>

                  <TableCell>{item.expiryDate}</TableCell>

                  <TableCell>{item.stockQty}</TableCell>
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
      </Paper>
    </Box>
  );
}
