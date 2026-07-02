import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import IconButton from "@mui/material/IconButton";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";

export default function ProcedureHistory() {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/procedure-bills");

      const sorted = [...res.data].sort((a, b) => b.id - a.id);

      setBills(sorted);
      setFilteredBills(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);

    const filtered = bills.filter((bill) =>
      (bill.billNo + bill.patientName + bill.mobile)
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

    setFilteredBills(filtered);
  }, [search, bills]);

  const totalRevenue = useMemo(() => {
    return filteredBills.reduce(
      (sum, b) => sum + Number(b.finalAmount || 0),
      0,
    );
  }, [filteredBills]);

  const todayBillsCount = filteredBills.filter((bill) => {
    const d = new Date(bill.billDate);
    const t = new Date();

    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  }).length;

  const todayRevenue = filteredBills.reduce((sum, bill) => {
    const d = new Date(bill.billDate);
    const t = new Date();

    const isToday =
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear();

    return isToday ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayCashRevenue = filteredBills.reduce((sum, bill) => {
    if (!bill.billDate) return sum;

    const billDate = new Date(bill.billDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isCash = bill.paymentMode?.toUpperCase() === "CASH";

    return isToday && isCash ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayUpiRevenue = filteredBills.reduce((sum, bill) => {
    if (!bill.billDate) return sum;

    const billDate = new Date(bill.billDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isUpi = bill.paymentMode?.toUpperCase() === "UPI";

    return isToday && isUpi ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const todayCardRevenue = filteredBills.reduce((sum, bill) => {
    if (!bill.billDate) return sum;

    const billDate = new Date(bill.billDate);
    const today = new Date();

    const isToday =
      billDate.getDate() === today.getDate() &&
      billDate.getMonth() === today.getMonth() &&
      billDate.getFullYear() === today.getFullYear();

    const isCard = bill.paymentMode?.toUpperCase() === "CARD";

    return isToday && isCard ? sum + Number(bill.finalAmount || 0) : sum;
  }, 0);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleGeneratePDF = async (billId) => {
    try {
      const res = await api.get(`api//api/procedure-bills/${billId}`);

      const billData = {
        ...res.data.bill,
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

    doc.text("PROCEDURE BILL", 105, 58, { align: "center" });

    // ==========================
    // PATIENT DETAILS
    // ==========================

    let y = 75;

    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.setFont(undefined, "bold");
    doc.text("Patient Name", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(String(billData.patientName || "-"), 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Bill No", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(String(billData.billNo || "-"), 155, y);

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

    const billDate = billData.billDate
      ? new Date(billData.billDate).toLocaleDateString("en-GB")
      : "-";

    doc.text(billDate, 155, y);

    // ==========================
    // PROCEDURE TABLE
    // ==========================

    const body = (billData.items || []).map((item, index) => [
      index + 1,
      item.procedureName || "",
      item.quantity || 0,
      Number(item.amount || 0).toFixed(2),
      Number(item.amount || 0).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y + 10,

      head: [["SI No", "Procedure", "Qty", "Rate", "Amount"]],

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

    const discount = Number(billData.discount || 0);

    const finalAmount = Number(billData.finalAmount || 0);

    doc.setFontSize(11);
    doc.setTextColor(0);

    doc.text(`Subtotal : Rs. ${subtotal.toFixed(2)}`, 195, finalY, {
      align: "right",
    });

    doc.text(`Discount : Rs. ${discount.toFixed(2)}`, 195, finalY + 8, {
      align: "right",
    });

    doc.setFont(undefined, "bold");
    doc.setFontSize(15);
    doc.setTextColor(30, 58, 138);

    doc.text(`Grand Total : Rs. ${finalAmount.toFixed(2)}`, 195, finalY + 22, {
      align: "right",
    });

    // ==========================
    // SIGNATURE
    // ==========================

    const signY = finalY + 50;

    doc.line(140, signY, 190, signY);

    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text("Authorized Signature", 148, signY + 8);

    // ==========================
    // FOOTER
    // ==========================

    doc.setFontSize(9);

    doc.text("Thank you for choosing Madhav Hospital", 105, 285, {
      align: "center",
    });

    // ==========================
    // SAVE
    // ==========================

    doc.save(`${billData.billNo || "ProcedureBill"}.pdf`);
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* HEADER */}

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
        {/* Background Circle */}

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
              <MedicalServicesIcon fontSize="large" />
              Procedure History
            </Typography>

            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
              }}
            >
              View, search and download all procedure billing records
            </Typography>
          </Box>

          {/* RIGHT */}

          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <Chip
              icon={<ReceiptLongIcon />}
              label={`Total Bills: ${filteredBills.length}`}
              sx={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.20)",

                "& .MuiChip-icon": {
                  color: "#BFDBFE",
                },
              }}
            />

            <Chip
              icon={<CurrencyRupeeIcon />}
              label={`Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}`}
              sx={{
                background: "rgba(16,185,129,0.20)",
                color: "#fff",
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.20)",

                "& .MuiChip-icon": {
                  color: "#BBF7D0",
                },
              }}
            />

            <Chip
              icon={<TodayIcon />}
              label={`Today Bills: ${todayBillsCount}`}
              sx={{
                background: "rgba(245,158,11,0.20)",
                color: "#fff",
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.20)",

                "& .MuiChip-icon": {
                  color: "#FDE68A",
                },
              }}
            />

            <Chip
              icon={<TrendingUpIcon />}
              label={`Today: ₹${todayRevenue.toLocaleString("en-IN")}`}
              sx={{
                background: "rgba(139,92,246,0.20)",
                color: "#fff",
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.20)",

                "& .MuiChip-icon": {
                  color: "#DDD6FE",
                },
              }}
            />

            <Chip
              icon={<TrendingUpIcon />}
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
              icon={<TrendingUpIcon />}
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

      {/* SEARCH */}

      <Paper
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search Bill No / Patient / Mobile"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* TABLE */}

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead
              sx={{
                background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  SI No
                </TableCell>
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Bill No
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Patient Name
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Mobile
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Date
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Amount
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  PAY
                </TableCell>

                <TableCell
                  align="center"
                  sx={{
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredBills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Records Found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBills
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bill, index) => (
                    <TableRow key={bill.id}>
                      <TableCell
                        sx={{ fontWeight: "500", textAlign: "center" }}
                      >
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{bill.billNo}</TableCell>

                      <TableCell>{bill.patientName}</TableCell>

                      <TableCell>{bill.mobile}</TableCell>

                      <TableCell>{formatDate(bill.billDate)}</TableCell>

                      <TableCell>₹{Math.round(bill.finalAmount)}</TableCell>

                      <TableCell>{bill.paymentMode}</TableCell>

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/procedure-bill/${bill.id}`)}
                          sx={{
                            mr: 1,

                            color: "#1E40AF",
                            backgroundColor: "#DBEAFE",

                            border: "1px solid #BFDBFE",

                            "&:hover": {
                              backgroundColor: "#BFDBFE",
                              transform: "scale(1.05)",
                            },

                            transition: "all 0.2s ease",
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleGeneratePDF(bill.id)}
                          sx={{
                            color: "#DC2626",
                            backgroundColor: "#FEE2E2",

                            border: "1px solid #FECACA",

                            "&:hover": {
                              backgroundColor: "#FECACA",
                              transform: "scale(1.05)",
                            },

                            transition: "all 0.2s ease",
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

        <TablePagination
          component="div"
          count={filteredBills.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
