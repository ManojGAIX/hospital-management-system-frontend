import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { createMedicine, updateMedicine } from "../api/medicineApi";

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
  Alert,
  Chip,
  Stack,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const API = "/api";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
export default function PharmacyPurchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const tableRef = useRef(null);

  const scrollLeft = () => {
    tableRef.current?.scrollBy({
      left: -350,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    tableRef.current?.scrollBy({
      left: 350,
      behavior: "smooth",
    });
  };

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

  const selectMedicine = (index, medicine) => {
    if (!medicine) return;
    setItems((current) =>
      current.map((item, rowIndex) =>
        rowIndex === index
          ? {
              ...item,
              medicineId: medicine.id,
              medicineName: medicine.medicineName || "",
              batchNo: medicine.batchNo || "",
              expiryDate: medicine.expiryDate || "",
              hsnCode: medicine.hsnCode || "",
              gstPercent: Number(medicine.gstPercent || 0),
              mrp: Number(medicine.mrp ?? medicine.price ?? 0),
              purchaseRate: Number(medicine.purchasePrice || 0),
            }
          : item,
      ),
    );
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
  const receivedQuantity = (item) =>
    Number(item.quantity || 0) + Number(item.freeQuantity || 0);
  const makeItemCode = (name, batch) =>
    `ITM-${`${name || "MED"}${batch || Date.now()}`
      .replace(/[^A-Z0-9]/gi, "")
      .slice(0, 12)
      .toUpperCase()}-${Date.now().toString().slice(-5)}`;

  // The medicine master is read by Medicines, billing and stock-register pages.
  // Each GRN updates only its matching medicine + batch; a new batch gets its own stock record.
  const syncInventoryFromGRN = async (grnItems) => {
    const inventory = [...medicines];
    for (const item of grnItems) {
      const batch = item.batchNo.trim().toUpperCase();
      const received = receivedQuantity(item);
      const selected = inventory.find(
        (medicine) => String(medicine.id) === String(item.medicineId),
      );
      const sameBatch = inventory.find(
        (medicine) =>
          medicine.medicineName?.trim().toUpperCase() ===
            item.medicineName.trim().toUpperCase() &&
          medicine.batchNo?.trim().toUpperCase() === batch,
      );
      const target =
        sameBatch ||
        (selected?.batchNo?.trim().toUpperCase() === batch ? selected : null);
      if (target) {
        const updated = {
          ...target,
          stockQuantity: Number(target.stockQuantity || 0) + received,
          batchNo: batch,
          expiryDate: item.expiryDate || target.expiryDate || null,
          purchasePrice: Number(item.purchaseRate || target.purchasePrice || 0),
          mrp: Number(item.mrp || target.mrp || target.price || 0),
          price: Number(item.mrp || target.price || 0),
          gstPercent: Number(item.gstPercent || 0),
          hsnCode: item.hsnCode || target.hsnCode || "",
          supplier: formData.supplierName || target.supplier || "",
        };
        await updateMedicine(target.id, updated);
        Object.assign(target, updated);
      } else if (selected) {
        const { id, ...source } = selected;
        const record = {
          ...source,
          itemCode: makeItemCode(item.medicineName, batch),
          barcode: "",
          medicineName: item.medicineName.trim().toUpperCase(),
          batchNo: batch,
          stockQuantity: received,
          expiryDate: item.expiryDate || null,
          purchasePrice: Number(item.purchaseRate || 0),
          mrp: Number(item.mrp || 0),
          price: Number(item.mrp || 0),
          gstPercent: Number(item.gstPercent || 0),
          hsnCode: item.hsnCode || "",
          supplier: formData.supplierName || source.supplier || "",
        };
        const response = await createMedicine(record);
        inventory.push(response.data || record);
      }
    }
  };
  const saveGRN = async () => {
    const validItems = items.filter(
      (item) =>
        item.medicineId &&
        item.medicineName &&
        item.batchNo &&
        item.expiryDate &&
        receivedQuantity(item) > 0 &&
        Number(item.purchaseRate) >= 0,
    );
    if (!formData.supplierId || !formData.billNumber || !formData.billDate) {
      setMessage({
        severity: "warning",
        text: "Enter supplier, supplier bill number and bill date before saving the GRN.",
      });
      return;
    }
    if (validItems.length !== items.length) {
      setMessage({
        severity: "warning",
        text: "Every GRN row needs a medicine, batch, expiry date and received quantity.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
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

        items: validItems,
      };

      console.log("GRN Payload", payload);

      await api.post("/api/pharmacy-purchase", payload);

      await syncInventoryFromGRN(validItems);
      setMessage({
        severity: "success",
        text: "GRN saved and medicine inventory has been updated.",
      });

      // Reset form
      setFormData({
        grnNumber: "GRN-" + new Date().getTime(),
        storeName: "Main Pharmacy",
        supplierId: "",
        supplierName: "",
        billNumber: "",
        billDate: "",
        poNumber: "",
        challanNumber: "",
        paymentMode: "CASH",
      });
      setItems([
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
      await loadMedicines();
    } catch (err) {
      console.error(err);
      await loadMedicines();
      setMessage({
        severity: "error",
        text: "The GRN could not be fully saved and synchronized. Check the purchase register before retrying.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 4,
          color: "#fff",
          background: "linear-gradient(125deg, #0f2f6f, #2563eb 58%, #0891b2)",
          boxShadow: "0 16px 36px rgba(30,64,175,.22)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Goods Receipt Note
              </Typography>
              <Typography sx={{ opacity: 0.82 }}>
                Receive stock once; medicine inventory stays in sync.
              </Typography>
            </Box>
          </Stack>
          <Chip
            icon={<LocalShippingOutlinedIcon />}
            label={`${items.length} line${items.length === 1 ? "" : "s"}`}
            sx={{
              bgcolor: "rgba(255,255,255,.16)",
              color: "#fff",
              fontWeight: 700,
            }}
          />
        </Stack>
      </Paper>
      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

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
              fullWidth
              label="Supplier"
              value={formData.supplierId}
              onChange={(e) => {
                const selectedSup = suppliers.find(
                  (s) => String(s.id) === String(e.target.value),
                );
                setFormData({
                  ...formData,
                  supplierId: e.target.value,
                  supplierName: selectedSup ? selectedSup.supplierName : "",
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

        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={scrollLeft}
            sx={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: "rgba(255,255,255,0.9)",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#1976d2",
                color: "#fff",
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <TableContainer
            ref={tableRef}
            sx={{
              overflowX: "auto",
              scrollBehavior: "smooth",
            }}
          >
            <Table sx={{ minWidth: 1350 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>SI No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>Medicine</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 110 }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 110 }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>Free</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>MRP</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>GST %</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 80 }}>Disc %</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 90 }}>HSN</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 90 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: "bold", minWidth: 70 }} align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500 }}>{index + 1}</TableCell>

                    <TableCell sx={{ minWidth: 200 }}>
                      <Autocomplete
                        options={medicines}
                        getOptionLabel={(option) => {
                          const code = option.itemCode
                            ? `[${option.itemCode}] `
                            : "";
                          return `${code}${option.medicineName || ""}`;
                        }}
                        value={
                          medicines.find(
                            (medicine) =>
                              String(medicine.id) === String(item.medicineId),
                          ) || null
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
                        sx={{ minWidth: 100 }}
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
                        sx={{ minWidth: 70 }}
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
                        sx={{ minWidth: 90 }}
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
                        sx={{ minWidth: 90 }}
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
                        sx={{ minWidth: 70 }}
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
                        sx={{ minWidth: 70 }}
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
                        sx={{ minWidth: 80 }}
                        value={item.hsnCode}
                        onChange={(e) =>
                          handleItemChange(index, "hsnCode", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={700} color="success.main" sx={{ minWidth: 80 }}>
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

          <IconButton
            onClick={scrollRight}
            sx={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              bgcolor: "rgba(255,255,255,0.9)",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "#1976d2",
                color: "#fff",
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

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
            disabled={saving}
            sx={{
              px: 5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg,#1E40AF,#06B6D4)",
            }}
          >
            {saving ? "Saving & syncing..." : "Save GRN & Update Stock"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}