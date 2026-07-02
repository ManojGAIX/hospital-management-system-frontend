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
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";

const API = "/api";

export default function PurchaseReturn() {
  const [suppliers, setSuppliers] = useState([]);

  const [grns, setGrns] = useState([]);

  const [items, setItems] = useState([]);

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

  useEffect(() => {
    loadSuppliers();
    loadGRNs();

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

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const savePurchaseReturn = async () => {
    try {
      await api.post(`${API}/purchase-returns`, {
        ...formData,

        totalAmount,

        items,
      });

      alert("Purchase Return Saved Successfully");
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

  //   const totalAmount = items.reduce(
  //     (sum, item) => sum + Number(item.amount || 0),
  //     0,
  //   );

  const clearForm = () => {
    setFormData({
      returnNumber: "",

      returnDate: new Date().toISOString().split("T")[0],

      supplierId: "",

      supplierName: "",

      grnNumber: "",

      remarks: "",
    });

    setItems([]);
  };

  return (
    <Box p={3}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Purchase Return
        </Typography>

        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
          }}
        ></Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="GRN Number"
                value={formData.grnNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,

                    grnNumber: e.target.value,
                  })
                }
              >
                {grns.map((g) => (
                  <MenuItem key={g.id} value={g.grnNumber}>
                    {g.grnNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
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
                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  SI No
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Medicine
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Batch No
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Return Qty
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Purchase Rate
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Amount
                </TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell sx={{ minWidth: 250 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item.medicineName}
                      onChange={(e) =>
                        handleItemChange(index, "medicineName", e.target.value)
                      }
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
          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={4}>
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
    </Box>
  );
}
