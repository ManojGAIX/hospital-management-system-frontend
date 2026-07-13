import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Chip,
  TableContainer,
  CircularProgress,
  TablePagination,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination States
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // =========================================
  // FETCH INVOICES
  // =========================================
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/bills/history");
      const rawData = res.data || [];

      // SORT: Latest Invoices First (Assumes higher database ID is newer)
      const sortedData = [...rawData].sort(
        (a, b) => Number(b.id) - Number(a.id),
      );

      setInvoices(sortedData);
      setFilteredInvoices(sortedData);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  const todayCashRevenue = filteredInvoices.reduce((sum, bill) => {
    if (!bill.saleDate) return sum;

    const billDate = new Date(bill.saleDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isCash = bill.paymentMode?.toUpperCase() === "CASH";

    return isToday && isCash ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayUpiRevenue = filteredInvoices.reduce((sum, bill) => {
    if (!bill.saleDate) return sum;

    const billDate = new Date(bill.saleDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isUpi = bill.paymentMode?.toUpperCase() === "UPI";

    return isToday && isUpi ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayCardRevenue = filteredInvoices.reduce((sum, bill) => {
    if (!bill.saleDate) return sum;

    const billDate = new Date(bill.saleDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isCard = bill.paymentMode?.toUpperCase() === "CARD";

    return isToday && isCard ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  // =========================================
  // SEARCH FILTER
  // =========================================
  useEffect(() => {
    setPage(0); // Reset page selection view index during active text matching loops
    if (!search) {
      setFilteredInvoices(invoices);
      return;
    }

    const lower = search.toLowerCase();

    const filtered = invoices.filter((inv) => {
      return (
        inv.invoiceNumber?.toLowerCase().includes(lower) ||
        inv.patientName?.toLowerCase().includes(lower) ||
        inv.visitNumber?.toLowerCase().includes(lower) ||
        String(inv.patientId || "")
          .toLowerCase()
          .includes(lower)
      );
    });

    setFilteredInvoices(filtered);
  }, [search, invoices]);

  // =========================================
  // SUMMARY CALCULATIONS
  // =========================================
  const totalRevenue = useMemo(() => {
    return filteredInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalAmount || 0),
      0,
    );
  }, [filteredInvoices]);

  // =========================================
  // FORMAT DATE
  // =========================================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================
  // FIXED: COMPREHENSIVE FILE DOWNLOAD HANDLER
  // =========================================
  const handleDownloadInvoice = async (id, invoiceNo) => {
    if (!id) return alert("Missing Invoice Identifier Reference Token");
    const downloadName = invoiceNo
      ? `Invoice_${invoiceNo}.pdf`
      : `Invoice_Ref_${id}.pdf`;

    try {
      const response = await api.get(`/api/bills/download/${id}`,
        { responseType: "blob" },
      );

      // Explicitly construct application file type stream payload bindings
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();

      // Instantly clear pointers from layout DOM space tree
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Binary invoice download crashed:", error);
      alert(
        "Could not process document file download. Verify backend pipeline server logging endpoints.",
      );
    }
  };

  // =========================================
  // PAGINATION HANDLERS
  // =========================================
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleGeneratePDF = async (invoiceId) => {
    console.log("invoiceId", invoiceId);
    try {
      const res = await api.get(`api/bills/${invoiceId}`,
      );
      console.log("invoice res.data", res.data);
      generatePDF(res.data);
    } catch (err) {
      console.error(err);

      alert("Failed to load invoice");
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();

    const inv = invoice.invoice;
    const items = invoice.items;

    // ==========================================
    // LOGO
    // ==========================================

    const logoWidth = 140;
    const logoHeight = 32;

    const pageWidth = doc.internal.pageSize.getWidth();

    const x = (pageWidth - logoWidth) / 2;

    doc.addImage(hospitalLogo, "PNG", x, 8, logoWidth, logoHeight);

    doc.setFontSize(10);
    doc.setTextColor(80);

    doc.text(
      "Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209",
      105,
      44,
      { align: "center" },
    );

    doc.setDrawColor(30, 58, 138);
    doc.line(10, 45, 200, 45);

    // ==========================================
    // TITLE
    // ==========================================

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, "bold");

    doc.text("INVOICE BILL", 105, 58, {
      align: "center",
    });

    // ==========================================
    // PATIENT DETAILS
    // ==========================================

    let y = 75;

    doc.setTextColor(0);
    doc.setFontSize(11);

    doc.setFont(undefined, "bold");
    doc.text("Patient Name", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(inv.patientName || "-", 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Invoice No", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(inv.invoiceNumber || "-", 155, y);

    // ==========================================

    y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Mobile", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(inv.mobileNo || "-", 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Visit No", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(inv.visitNumber || "-", 155, y);

    // ==========================================

    y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Date", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(new Date(inv.invoiceDate).toLocaleDateString("en-GB"), 55, y);

    // ==========================================
    // TABLE
    // ==========================================

    const filteredItems = (items || []).filter(
      (item) =>
        item.itemType?.toUpperCase() !== "ADMISSION" &&
        item.itemName !== "Admission Fee"
    );

    const body = filteredItems.map((item, index) => {
      const isBed = item.itemType?.toUpperCase() === "BED";
      const displayName = isBed
        ? `Bed Charges${item.itemName ? ` (${item.itemName})` : ""}`
        : item.itemName;
      return [
        index + 1,
        displayName,
        item.quantity,
        Number(item.unitPrice || 0).toFixed(2),
        Number(item.subtotal || 0).toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: y + 10,

      head: [["SI No", "Description", "Qty", "Price", "Amount"]],

      body,

      theme: "grid",

      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        halign: "center",
      },

      columnStyles: {
        0: {
          cellWidth: 15,
          halign: "center",
        },

        1: {
          cellWidth: 90,
        },

        2: {
          cellWidth: 20,
          halign: "center",
        },

        3: {
          cellWidth: 30,
          halign: "right",
        },

        4: {
          cellWidth: 35,
          halign: "right",
        },
      },
    });

    // ==========================================
    // TOTALS
    // ==========================================

    let finalY = doc.lastAutoTable.finalY + 15;

    if (finalY + 50 > 280) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.text(`Subtotal : Rs. ${Number(inv.subtotal || 0).toFixed(2)}`, 195, finalY, {
      align: "right",
    });

    doc.text(
      `Discount : Rs. ${Number(inv.discount || 0).toFixed(2)}`,
      195,
      finalY + 8,
      { align: "right" },
    );

    doc.setFont(undefined, "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);

    doc.text(
      `Grand Total : Rs. ${Number(inv.totalAmount || 0).toFixed(2)}`,
      195,
      finalY + 20,
      { align: "right" },
    );

    // ==========================================
    // SIGNATURE
    // ==========================================

    const signY = finalY + 40;

    doc.line(140, signY, 190, signY);

    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text("Authorized Signature", 148, signY + 8);

    // ==========================================
    // SAVE
    // ==========================================

    doc.save(`${inv.invoiceNumber}.pdf`);
  };

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "auto" }}>
      {/* HEADER PANELS */}
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
        {/* Background Effect */}

        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <Box
          sx={{
            position: "relative",

            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",

            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* LEFT */}

          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <ReceiptLongIcon fontSize="large" />
              Invoice History
            </Typography>

            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                fontSize: "0.95rem",
              }}
            >
              Track, view and download all generated invoices
            </Typography>
          </Box>

          {/* RIGHT */}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<ReceiptLongIcon />}
              label={`${filteredInvoices.length} Invoices`}
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

            {/* <Chip
              icon={<CurrencyRupeeIcon />}
              label={`₹${totalRevenue.toLocaleString("en-IN")}`}
              sx={{
                height: 42,

                background: "rgba(16,185,129,0.20)",

                backdropFilter: "blur(10px)",

                color: "#fff",

                border: "1px solid rgba(255,255,255,0.20)",

                fontWeight: 700,

                "& .MuiChip-icon": {
                  color: "#BBF7D0",
                },
              }}
            /> */}

            {/* <Chip
              icon={<CurrencyRupeeIcon />}
              label={`Today Cash: ₹${todayCashRevenue.toLocaleString("en-IN")}`}
              sx={{
                height: 42,

                background: "rgba(245,158,11,0.20)",

                backdropFilter: "blur(10px)",

                color: "#fff",

                border: "1px solid rgba(255,255,255,0.20)",

                fontWeight: 700,

                "& .MuiChip-icon": {
                  color: "#FDE68A",
                },
              }}
            /> */}

            {/* <Chip
              icon={<CurrencyRupeeIcon />}
              label={`Today UPI: ₹${todayUpiRevenue.toLocaleString("en-IN")}`}
              sx={{
                height: 42,

                background: "rgba(245,158,11,0.20)",

                backdropFilter: "blur(10px)",

                color: "#fff",

                border: "1px solid rgba(255,255,255,0.20)",

                fontWeight: 700,

                "& .MuiChip-icon": {
                  color: "#FDE68A",
                },
              }}
            /> */}
          </Box>
        </Box>
      </Paper>

      {/* SEARCH PANEL BAR */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 3, borderRadius: "16px", border: "1px solid #e2e8f0" }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Invoice No / Visit No / Patient Name / PRN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#f8fafc",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* DATA VIEW CONTAINER */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead
              sx={{
                background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              }}
            >
              <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                <TableCell sx={{ fontWeight: 800 }}>SI No</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Invoice No</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>PRN</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Patient Name</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Visit No</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Billing Date</TableCell>

                <TableCell sx={{ fontWeight: 800 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>PAY</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box py={4}>
                      <Typography
                        variant="body1"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        No invoices found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((inv, index) => (
                    <TableRow
                      key={inv.id}
                      hover
                      sx={{
                        transition: "0.2s",
                        "&:hover": { backgroundColor: "#f8fafc" },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "500", textAlign: "center" }}
                      >
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1e3a8a" }}>
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        {inv.patientId
                          ? `PRN${String(inv.patientId).padStart(4, "0")}`
                          : "-"}
                      </TableCell>
                      <TableCell>{inv.patientName}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#0284c7" }}>
                        {inv.visitNumber || "N/A"}
                      </TableCell>
                      <TableCell>
                        {formatDate(
                          inv.billDate || inv.invoiceDate || inv.createdAt,
                        )}
                      </TableCell>
                      <TableCell>
                        ₹{Number(inv.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#1e3a8a" }}>
                        {inv.paymentMode}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleGeneratePDF(inv.id)}
                          sx={{
                            color: "#1E40AF",

                            background: "rgba(255,255,255,0.75)",
                            backdropFilter: "blur(10px)",

                            border: "1px solid rgba(30,64,175,0.15)",

                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

                            "&:hover": {
                              background: "#EFF6FF",
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* TABULAR LAYOUT PAGINATION FOOTER */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
