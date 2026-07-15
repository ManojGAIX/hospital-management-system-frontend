import React, { useEffect, useState } from "react";

import api from "../services/api";
import { getMedicineLabel } from "../utils/medicineFormatter";

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
  MenuItem,
} from "@mui/material";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CurrentStockRegister() {
  const API = "/api";

  const [stocks, setStocks] = useState([]);

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("all");

  const loadStock = async () => {
    try {
      const res = await api.get(`${API}/stock`);

      setStocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const filtered = stocks.filter((s) =>
    [s.medicineName, s.batchNo, s.itemCode]
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
      "Item Code": item.itemCode || "N/A",
      Medicine: getMedicineLabel(item) || item.medicineName,
      Batch: item.batchNo,
      Expiry: item.expiryDate,
      StockQty: item.stockQty,
      PurchaseRate: item.purchaseRate,
      MRP: item.mrp,
      "GST %": `${item.gstPercent || 0}%`,
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
        "Item Code": item.itemCode || "N/A",
        Medicine: getMedicineLabel(item) || item.medicineName,
        Batch: item.batchNo,
        Expiry: item.expiryDate,
        StockQty: item.stockQty,
        PurchaseRate: item.purchaseRate,
        MRP: item.mrp,
        "GST %": `${item.gstPercent || 0}%`,
        StockValue: item.stockValue,
      }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Stock");

    XLSX.writeFile(workbook, "NearExpiryItemsReport.xlsx");
  };

  const getReportItems = () => {
    if (reportType === "expiry") {
      return filtered.filter((item) => {
        const exp = new Date(item.expiryDate);
        const diff = (exp - new Date()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 90;
      });
    }

    if (reportType === "lowStock") {
      return filtered.filter((item) => Number(item.stockQty) < 10);
    }

    if (reportType === "expired") {
      return filtered.filter((item) => {
        const exp = new Date(item.expiryDate);
        return exp < new Date();
      });
    }

    return filtered;
  };

  const getReportLabel = () => {
    if (reportType === "expiry") return "Near Expiry Items";
    if (reportType === "lowStock") return "Low Stock Items";
    if (reportType === "expired") return "Expired Items List";
    return "Current Stock Register";
  };

  const exportReport = () => {
    const reportItems = getReportItems();
    const excelData = reportItems.map((item) => ({
      "Item Code": item.itemCode || "N/A",
      Medicine: getMedicineLabel(item) || item.medicineName,
      StockQty: item.stockQty,
      PurchaseRate: item.purchaseRate,
      MRP: item.mrp,
      "GST %": `${item.gstPercent || 0}%`,
      StockValue: item.stockValue,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${getReportLabel().replace(/\s+/g, "")}.xlsx`);
  };

  const printReport = () => {
    const reportItems = getReportItems();
    const doc = new jsPDF();
    const title = getReportLabel();

    doc.setFontSize(18);
    doc.text(title, 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [
        [
          "Item Code",
          "Medicine",
          "Batch",
          "Expiry",
          "Qty",
          "MRP",
          "GST",
          "Value",
        ],
      ],
      body: reportItems.map((item) => [
        item.itemCode || "N/A",
        getMedicineLabel(item) || item.medicineName,
        item.batchNo,
        item.expiryDate,
        item.stockQty,
        item.mrp,
        `${item.gstPercent || 0}%`,
        item.stockValue,
      ]),
    });

    doc.save(`${title.replace(/\s+/g, "")}.pdf`);
  };

  const printStockReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text("CURRENT STOCK REGISTER", 55, 15);

    autoTable(doc, {
      startY: 25,

      head: [
        [
          "Item Code",
          "Medicine",
          "Batch",
          "Expiry",
          "Qty",
          "MRP",
          "GST",
          "Value",
        ],
      ],

      body: filtered.map((item) => [
        item.itemCode || "N/A",
        getMedicineLabel(item) || item.medicineName,
        item.batchNo,
        item.expiryDate,
        item.stockQty,
        item.mrp,
        `${item.gstPercent || 0}%`,
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
          alignItems: "stretch",
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
          }}
        >
          <Typography color="text.secondary">Total Medicines</Typography>

          <Typography variant="h5" fontWeight={700} color="primary">
            {filtered.length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(236, 72, 153, 0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(236, 72, 153, 0.25)",
            boxShadow: "0 18px 40px rgba(236,72,153,0.12)",
          }}
        >
          <Typography color="text.secondary">Total Stock Qty</Typography>

          <Typography variant="h5" fontWeight={700} color="secondary">
            {filtered.reduce((sum, s) => sum + Number(s.stockQty || 0), 0)}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(16, 185, 129, 0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            boxShadow: "0 18px 40px rgba(16,185,129,0.12)",
          }}
        >
          <Typography color="text.secondary">Inventory Value</Typography>

          <Typography variant="h5" fontWeight={700} color="success.main">
            ₹
            {filtered
              .reduce((sum, s) => sum + Number(s.stockValue || 0), 0)
              .toFixed(2)}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(251, 146, 60, 0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(251, 146, 60, 0.25)",
            boxShadow: "0 18px 40px rgba(251,146,60,0.12)",
          }}
        >
          <Typography color="text.secondary">Low Stock Items</Typography>

          <Typography variant="h5" fontWeight={700} color="warning.main">
            {filtered.filter((s) => s.stockQty < 10).length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(239, 68, 68, 0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            boxShadow: "0 18px 40px rgba(239,68,68,0.12)",
          }}
        >
          <Typography color="error">Expired Medicines</Typography>

          <Typography variant="h4" fontWeight={700}>
            {expiredCount}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: "rgba(234, 179, 8, 0.12)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(234, 179, 8, 0.25)",
            boxShadow: "0 18px 40px rgba(234,179,8,0.12)",
          }}
        >
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
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          select
          label="Report Type"
          size="small"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          sx={{ minWidth: 220, bgcolor: "background.paper" }}
        >
          <MenuItem value="all">Current Stock Register</MenuItem>
          <MenuItem value="expiry">Near Expiry Items</MenuItem>
          <MenuItem value="lowStock">Low Stock Items</MenuItem>
          <MenuItem value="expired">Expired Items</MenuItem>
        </TextField>

        <Button variant="contained" onClick={exportReport}>
          Export Report
        </Button>

        <Button variant="contained" color="success" onClick={printReport}>
          Print Report
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
                  "Item Code",
                  "Medicine",
                  "Batch",
                  "Expiry",
                  "Stock Qty",
                  "Purchase",
                  "MRP",
                  "GST %",
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
                    <TableCell sx={{ fontWeight: "bold", color: "#475569" }}>
                      {row.itemCode || "N/A"}
                    </TableCell>
                    <TableCell>
                      {getMedicineLabel(row) || row.medicineName}
                    </TableCell>
                    <TableCell>{row.batchNo}</TableCell>
                    <TableCell>{row.expiryDate}</TableCell>
                    <TableCell>{row.stockQty}</TableCell>
                    <TableCell>
                      ₹{Number(row.purchaseRate).toFixed(2)}
                    </TableCell>
                    <TableCell>₹{Number(row.mrp).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${row.gstPercent || 0}%`}
                        size="small"
                        variant="outlined"
                        color="info"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
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
                  <TableCell>
                    {getMedicineLabel(item) || item.medicineName}
                  </TableCell>
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
