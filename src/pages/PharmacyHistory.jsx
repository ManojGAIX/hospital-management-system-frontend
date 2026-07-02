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
  TableHead,
  TableRow,
  TableContainer,
  Button,
  TablePagination,
  Chip,
} from "@mui/material";

import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import TodayIcon from "@mui/icons-material/Today";

import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import IconButton from "@mui/material/IconButton";

<IconButton
  color="error"
  onClick={() => handleGeneratePDF(sale.id)}
  title="Download PDF"
>
  <PictureAsPdfIcon fontSize="large" />
</IconButton>;

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";
import { useNavigate } from "react-router-dom";

export default function PharmacyHistory() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5); // Default to 5 rows

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("api/pharmacy/history");

      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = sales.filter(
    (s) =>
      (s.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile || "").includes(search),
  );

  const totalRevenue = filtered.reduce(
    (sum, bill) => sum + Number(bill.finalAmount || 0),
    0,
  );

  const todayRevenue = filtered.reduce((sum, bill) => {
    if (!bill.saleDate) return sum;

    const billDate = new Date(bill.saleDate);

    const today = new Date();

    console.log("billDate", billDate);
    console.log("today", today);

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    console.log("isToday", isToday);

    return isToday ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayBillsCount = filtered.filter((bill) => {
    if (!bill.saleDate) return false;

    const billDate = new Date(bill.saleDate);
    const today = new Date();

    return (
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const todayCashRevenue = filtered.reduce((sum, bill) => {
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

  const todayUpiRevenue = filtered.reduce((sum, bill) => {
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

  const todayCardRevenue = filtered.reduce((sum, bill) => {
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

  const handleView = (id) => {
    window.open(`/pharmacy-bill/${id}`, "_blank");
  };

  const handleGeneratePDF = async (saleId) => {
    try {
      const res = await api.get(`/api/pharmacy/${saleId}`);

      const billData = {
        ...res.data.invoice, // ✅ invoice, not sale
        items: res.data.items || [],
      };

      generatePDF(billData);
    } catch (err) {
      console.error(err);
      alert("Failed to load bill details");
    }
  };

  const generatePDF = (billData) => {
    if (!billData) return;

    const doc = new jsPDF();

    // ==========================
    // LOGO
    // ==========================

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

    doc.line(10, 45, 200, 45);

    // ==========================
    // TITLE
    // ==========================

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, "bold");

    doc.text("PHARMACY BILL", 105, 58, {
      align: "center",
    });

    // ==========================
    // PATIENT DETAILS
    // ==========================

    let y = 75;

    doc.setTextColor(0);
    doc.setFontSize(11);

    doc.setFont(undefined, "bold");
    doc.text("Patient Name", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(String(billData.patientName || "-"), 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Invoice No", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(String(billData.invoiceNumber || "-"), 155, y);

    y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Mobile", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(String(billData.mobile || "-"), 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Date", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");

    const billDate = billData.saleDate
      ? new Date(billData.saleDate).toLocaleDateString("en-GB")
      : "-";

    doc.text(billDate, 155, y);

    // ==========================
    // ITEMS TABLE
    // ==========================

    const body = (billData.items || []).map((item, index) => [
      index + 1,
      item.medicineName || "",
      item.quantity || 0,
      Number(item.unitPrice || 0).toFixed(2),
      `${item.gstPercent || 0}%`,
      Number(item.subtotal || 0).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y + 10,

      head: [["SI No", "Medicine", "Qty", "Price", "GST", "Amount"]],

      body,

      theme: "grid",

      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        halign: "center",
      },
    });

    // ==========================
    // TOTALS
    // ==========================

    const finalY = doc.lastAutoTable.finalY + 15;

    const subtotal = Number(billData.subtotal || 0);
    const gstAmount = Number(billData.gstAmount || 0);
    const discount = Number(billData.discount || 0);
    const finalAmount = Number(billData.finalAmount || 0);

    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.text(`Subtotal : Rs. ${subtotal.toFixed(2)}`, 195, finalY, {
      align: "right",
    });

    doc.text(`GST : Rs. ${gstAmount.toFixed(2)}`, 195, finalY + 8, {
      align: "right",
    });

    doc.text(`Discount : Rs. ${discount.toFixed(2)}`, 195, finalY + 16, {
      align: "right",
    });

    doc.setFont(undefined, "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 58, 138);

    doc.text(`Grand Total : Rs. ${finalAmount.toFixed(2)}`, 195, finalY + 30, {
      align: "right",
    });

    // ==========================
    // SIGNATURE
    // ==========================

    const signY = finalY + 55;

    doc.line(140, signY, 190, signY);

    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text("Authorized Signature", 148, signY + 8);

    // ==========================
    // SAVE
    // ==========================

    doc.save(`${billData.invoiceNumber || "PharmacyBill"}.pdf`);
  };

  const paginatedInvoices = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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
        {/* Background Effect */}

        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 160,
            height: 160,
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
          {/* LEFT SIDE */}

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
              <LocalPharmacyIcon fontSize="large" />
              Pharmacy Billing History
            </Typography>

            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
              }}
            >
              View, search and download all pharmacy bills
            </Typography>
          </Box>

          {/* RIGHT SIDE */}

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<ReceiptLongIcon />}
              label={`Total Bills: ${filtered.length} `}
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
              icon={<CurrencyRupeeIcon />}
              label={`Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")} `}
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
            />

            <Chip
              icon={<TodayIcon />}
              label={`Today Bills: ${todayBillsCount} `}
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
            />

            <Chip
              icon={<TodayIcon />}
              label={`Today : ₹${todayRevenue.toLocaleString("en-IN")}`}
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
            />

            <Chip
              icon={<TodayIcon />}
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
            />

            <Chip
              icon={<TodayIcon />}
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
            />
          </Box>
        </Box>
      </Paper>
      <TextField
        fullWidth
        placeholder="Search Invoice / Patient / Mobile"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TableContainer>
        <Table size="small">
          <TableHead
            sx={{
              background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
            }}
          >
            <TableRow
              sx={{
                background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              }}
            >
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                SI No
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>Invoice No</TableCell>

              <TableCell sx={{ color: "#fff" }}>Patient</TableCell>

              <TableCell sx={{ color: "#fff" }}>Mobile</TableCell>

              <TableCell sx={{ color: "#fff" }}>Date</TableCell>

              <TableCell sx={{ color: "#fff" }}>Amount</TableCell>

              <TableCell sx={{ color: "#fff" }}>PAY</TableCell>

              <TableCell sx={{ color: "#fff" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedInvoices.map((sale, index) => (
              <TableRow key={sale.id}>
                <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                  {page * rowsPerPage + index + 1}
                </TableCell>
                <TableCell>{sale.invoiceNumber}</TableCell>

                <TableCell>{sale.patientName}</TableCell>

                <TableCell>{sale.mobile}</TableCell>

                <TableCell>
                  {new Date(sale.saleDate).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  ₹
                  {Math.round(Number(sale.finalAmount || 0)).toLocaleString(
                    "en-IN",
                  )}
                </TableCell>

                <TableCell>{sale.paymentMode}</TableCell>

                <TableCell>
                  {/* <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/pharmacy-bill/${sale.id}`)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button> */}
                  <IconButton
                    size="small"
                    onClick={() => handleGeneratePDF(sale.id)}
                    sx={{
                      color: "#DC2626",
                      backgroundColor: "#FEF2F2",

                      border: "1px solid #FECACA",

                      transition: "all 0.2s ease",

                      "&:hover": {
                        backgroundColor: "#FEE2E2",
                        transform: "scale(1.08)",
                      },
                    }}
                  >
                    <PictureAsPdfIcon fontSize="small" />
                  </IconButton>
                  {/* <IconButton
                      onClick={() => handleGeneratePDF(sale.id)}
                      sx={{
                        bgcolor: "#d32f2f",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "#b71c1c",
                        },
                      }}
                    >
                      <PictureAsPdfIcon />
                    </IconButton> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Added Pagination Component below TableContainer */}
      {/* TABULAR LAYOUT PAGINATION FOOTER */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}
