import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Divider,
} from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import hospitalLogo from "/logo.png";

export default function PharmacyBillView() {
  const { id } = useParams();

  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadBill();
  }, []);

  const loadBill = async () => {
    try {
      const res = await api.get(`/api/pharmacy/${id}`);

      setSale(res.data.sale);
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load bill");
    }
  };

  const generatePDF = () => {
    if (!sale) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("PHARMACY BILL", 105, 20, {
      align: "center",
    });

    doc.setFontSize(11);

    doc.text(`Invoice No : ${sale.invoiceNumber}`, 15, 40);

    doc.text(`Patient : ${sale.patientName}`, 15, 50);

    doc.text(`Mobile : ${sale.mobile}`, 15, 60);

    doc.text(
      `Date : ${new Date(sale.saleDate).toLocaleDateString("en-IN")}`,
      15,
      70,
    );

    const body = items.map((i, index) => [
      index + 1,
      i.medicineName,
      i.quantity,
      i.unitPrice.toFixed(2),
      `${i.gstPercent}%`,
      i.subtotal.toFixed(2),
    ]);

    autoTable(doc, {
      startY: 85,

      head: [["SI No", "Medicine", "Qty", "Price", "GST", "Subtotal"]],

      body,
    });

    const y = doc.lastAutoTable.finalY + 15;

    doc.text(`Subtotal : ₹${sale.subtotal.toFixed(2)}`, 140, y);

    doc.text(`GST : ₹${sale.gstAmount.toFixed(2)}`, 140, y + 10);

    doc.text(`Discount : ₹${sale.discount.toFixed(2)}`, 140, y + 20);

    doc.setFontSize(14);

    doc.text(`Final Amount : ₹${sale.finalAmount.toFixed(2)}`, 140, y + 35);

    doc.save(`${sale.invoiceNumber}.pdf`);
  };

  if (!sale) return null;

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Pharmacy Bill Details
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography>Invoice :{sale.invoiceNumber}</Typography>

        <Typography>Patient :{sale.patientName}</Typography>

        <Typography>Mobile :{sale.mobile}</Typography>

        <Typography>
          Date :{new Date(sale.saleDate).toLocaleDateString()}
        </Typography>

        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>SI No</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>GST</TableCell>
              <TableCell>Subtotal</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((i, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{i.medicineName}</TableCell>

                <TableCell>{i.quantity}</TableCell>

                <TableCell>₹{i.unitPrice}</TableCell>

                <TableCell>{i.gstPercent}%</TableCell>

                <TableCell>₹{i.subtotal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box
          sx={{
            mt: 3,
            textAlign: "right",
          }}
        >
          <Typography>Subtotal : ₹{sale.subtotal}</Typography>

          <Typography>GST : ₹{sale.gstAmount}</Typography>

          <Typography>Discount : ₹{sale.discount}</Typography>

          <Typography variant="h6" fontWeight="bold">
            Final Amount : ₹{sale.finalAmount}
          </Typography>
        </Box>

        <Button variant="contained" sx={{ mt: 3 }} onClick={generatePDF}>
          Download PDF
        </Button>
      </Paper>
    </Box>
  );
}
