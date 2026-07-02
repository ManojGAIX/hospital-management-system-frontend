import React, { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Autocomplete,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const API = "/api";

export default function PharmacyPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [formData, setFormData] = useState({
    grnNumber: "",
    storeName: "Main Pharmacy",

    supplierId: "",
    supplierName: "",

    billNumber: "",
    billDate: "",

    poNumber: "",
    challanNumber: "",

    paymentMode: "CASH",
  });

  useEffect(() => {
    generateGRN();
    loadSuppliers();
    loadMedicines();
  }, []);

  const generateGRN = () => {
    const no = "GRN-" + new Date().getTime();

    setFormData((prev) => ({
      ...prev,
      grnNumber: no,
    }));
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get(`${API}/suppliers`);

      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await api.get(`${API}/medicines`);

      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [items, setItems] = useState([
    {
      medicineId: "",
      medicineName: "",

      batchNo: "",
      expiryDate: "",

      quantity: 1,
      freeQuantity: 0,

      purchaseRate: 0,
      mrp: 0,

      gstPercent: 0,
      discountPercent: 0,

      hsnCode: "",

      amount: 0,
    },
  ]);

  const deleteRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];

    updated[index][field] = value;

    const quantity = Number(updated[index].quantity || 0);
    const rate = Number(updated[index].purchaseRate || 0);
    const gst = Number(updated[index].gstPercent || 0);
    const discount = Number(updated[index].discountPercent || 0);

    let amount = quantity * rate;

    amount += (amount * gst) / 100;

    amount -= (amount * discount) / 100;

    updated[index].amount = amount;

    setItems(updated);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        medicineId: "",
        medicineName: "",
        batchNo: "",
        expiryDate: "",
        quantity: 1,
        freeQuantity: 0,
        purchaseRate: 0,
        mrp: 0,
        gstPercent: 0,
        discountPercent: 0,
        hsnCode: "",
        amount: 0,
      },
    ]);
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.purchaseRate || 0),
    0,
  );

  const totalDiscount = items.reduce((sum, item) => {
    const base = Number(item.quantity || 0) * Number(item.purchaseRate || 0);

    return sum + (base * Number(item.discountPercent || 0)) / 100;
  }, 0);

  const totalGST = items.reduce((sum, item) => {
    const base = Number(item.quantity || 0) * Number(item.purchaseRate || 0);

    const discount = (base * Number(item.discountPercent || 0)) / 100;

    const taxable = base - discount;

    return sum + (taxable * Number(item.gstPercent || 0)) / 100;
  }, 0);

  const grandTotal = subtotal - totalDiscount + totalGST;

  const gstAmount = items.reduce((sum, item) => {
    const base = Number(item.quantity || 0) * Number(item.purchaseRate || 0);

    return sum + (base * Number(item.gstPercent || 0)) / 100;
  }, 0);

  const discountAmount = items.reduce((sum, item) => {
    const base = Number(item.quantity || 0) * Number(item.purchaseRate || 0);

    return sum + (base * Number(item.discountPercent || 0)) / 100;
  }, 0);

  const netAmount = subtotal + gstAmount - discountAmount;

  const saveGRN = async () => {
    try {
      const payload = {
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        storeId: formData.storeId,

        grnNumber: formData.grnNumber,
        billNumber: formData.billNumber,

        billDate: formData.billDate,
        poNumber: formData.poNumber,
        challanNumber: formData.challanNumber,

        subtotal,
        gstAmount: totalGST,
        discountAmount: totalDiscount,
        totalAmount: grandTotal,

        items,
      };

      console.log("GRN Payload", payload);

      await api.get("/api/pharmacy-purchase", payload);

      alert("GRN Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Failed To Save GRN");
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="GRN Number"
              value={formData.grnNumber}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Bill No"
              value={formData.billNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billNumber: e.target.value,
                })
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Bill Date"
              value={formData.billDate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billDate: e.target.value,
                })
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              sx={{ minWidth: 180 }}
              label="Supplier"
              value={formData.supplierId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  supplierId: e.target.value,
                })
              }
            >
              {suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.supplierName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          mt: 3,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(90deg,#1E40AF,#2563EB)",
            color: "#fff",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Medicine Purchase Details
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SI No</TableCell>
                <TableCell>Medicine</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Free</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>MRP</TableCell>
                <TableCell>GST %</TableCell>
                <TableCell>Disc %</TableCell>
                <TableCell>HSN</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell sx={{ minWidth: 220 }}>
                    <Autocomplete
                      options={medicines}
                      getOptionLabel={(option) => option.medicineName || ""}
                      onChange={(event, value) => {
                        if (!value) return;

                        handleItemChange(index, "medicineId", value.id);

                        handleItemChange(
                          index,
                          "medicineName",
                          value.medicineName,
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Search Medicine"
                        />
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 100 }}
                      value={item.batchNo}
                      onChange={(e) =>
                        handleItemChange(index, "batchNo", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) =>
                        handleItemChange(index, "expiryDate", e.target.value)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 90 }}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 70 }}
                      type="number"
                      value={item.freeQuantity}
                      onChange={(e) =>
                        handleItemChange(index, "freeQuantity", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 80 }}
                      type="number"
                      value={item.purchaseRate}
                      onChange={(e) =>
                        handleItemChange(index, "purchaseRate", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 100 }}
                      type="number"
                      value={item.mrp}
                      onChange={(e) =>
                        handleItemChange(index, "mrp", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 60 }}
                      type="number"
                      value={item.gstPercent}
                      onChange={(e) =>
                        handleItemChange(index, "gstPercent", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 60 }}
                      type="number"
                      value={item.discountPercent}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "discountPercent",
                          e.target.value,
                        )
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      sx={{ minWidth: 70 }}
                      value={item.hsnCode}
                      onChange={(e) =>
                        handleItemChange(index, "hsnCode", e.target.value)
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700} color="success.main">
                      ₹{Number(item.amount).toFixed(2)}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => removeRow(index)}
                      sx={{
                        backgroundColor: "#fee2e2",
                        "&:hover": {
                          backgroundColor: "#fecaca",
                          transform: "scale(1.1)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            variant="contained"
            onClick={addRow}
            sx={{
              borderRadius: 3,
              textTransform: "none",
            }}
          >
            Add Medicine
          </Button>
        </Box>
      </Paper>

      <Paper
        sx={{
          mt: 3,
          p: 3,
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <Typography variant="h6" fontWeight={700} mb={3} color="primary">
          GRN Summary
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#eff6ff",
              }}
            >
              <Typography color="text.secondary">Subtotal</Typography>

              <Typography variant="h6" fontWeight={700}>
                ₹ {subtotal.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#ecfeff",
              }}
            >
              <Typography color="text.secondary">GST Amount</Typography>

              <Typography variant="h6" fontWeight={700} color="info.main">
                ₹ {gstAmount.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#fff7ed",
              }}
            >
              <Typography color="text.secondary">Discount</Typography>

              <Typography variant="h6" fontWeight={700} color="warning.main">
                ₹ {discountAmount.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                bgcolor: "#ecfdf5",
              }}
            >
              <Typography color="text.secondary">Net Amount</Typography>

              <Typography variant="h5" fontWeight={800} color="success.main">
                ₹ {netAmount.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setItems([]);
            }}
            sx={{
              borderRadius: 3,
              textTransform: "none",
            }}
          >
            Clear
          </Button>

          <Button
            variant="contained"
            onClick={saveGRN}
            sx={{
              px: 5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg,#1E40AF,#06B6D4)",
            }}
          >
            Save GRN
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
