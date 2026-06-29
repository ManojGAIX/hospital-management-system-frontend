import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Divider,
  Autocomplete,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function ProcedureBilling() {
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [procedures, setProcedures] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [visitId, setVisitId] = useState("");

  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");

  const [discount, setDiscount] = useState(0);

  const [items, setItems] = useState([]);

  const [paymentMode, setPaymentMode] = useState("CASH");

  const [notification, setNotification] = useState({
      open: false,
      message: "",
      severity: "success",
    });
  
    const showNotification = (message, severity = "success") => {
      setNotification({
        open: true,
        message,
        severity,
      });
    };
  

  useEffect(() => {
    loadPatients();
    loadProcedures();
  }, []);

  const loadPatients = async () => {
    const res = await axios.get("http://localhost:8080/api/patients");
    setPatients(res.data);
  };

  const loadProcedures = async () => {
    const res = await axios.get("http://localhost:8080/api/procedures");
    setProcedures(res.data);
  };

  const handlePatientChange = async (value) => {
    setPatientId(value);

    const patient = patients.find((p) => String(p.id) === String(value));

    if (patient) {
      setPatientName(patient.name);
      setMobile(patient.phone || "");
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/visits/active/${value}`,
      );

      setVisits(response.data);

      if (response.data.length > 0) {
        setVisitId(response.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVisitChange = (e) => {
    setVisitId(e.target.value);
  };

  const addProcedure = () => {
    setItems([
      ...items,
      {
        procedureId: "",
        procedureName: "",
        amount: 0,
      },
    ]);
  };

  const handleProcedureChange = (index, procedureId) => {
    const procedure = procedures.find((p) => p.id === procedureId);

    const updated = [...items];

    updated[index] = {
      procedureId,
      procedureName: procedure.procedureName,
      amount: procedure.charge,
    };

    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...items];

    updated.splice(index, 1);

    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0);

  const finalAmount = subtotal - Number(discount || 0);

  const saveBill = async () => {
    // Patient Validation
    if (!patientId || !patientName?.trim()) {
      alert("Please select a patient");
      return;
    }

    // Visit Validation
    if (!visitId) {
      alert("Please select a visit");
      return;
    }

    // Procedure Validation
    if (items.length === 0) {
      alert("Please add at least one procedure");
      return;
    }

    const payload = {
      patientId,
      visitId,
      patientName,
      mobile,
      subtotal,
      discount,
      finalAmount,
      paymentMode,
      items,
    };

    try {
      await axios.post("http://localhost:8080/api/procedure-bills", payload);

      alert("Procedure Bill Saved");

      setPatientId("");
      setPatientName("");
      setVisitId("");
      setMobile("");
      setItems([]);
      setDiscount(0);
    } catch (err) {
      console.error(err);
      alert("Failed");
    }
  };

  return (
    <Box p={3}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2}>
          {/* Patient Search */}

          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ flex: 1, minWidth: "310px" }}
              autoHighlight
              options={patients}
              getOptionLabel={(option) =>
                `${option.patientCode || ""} - ${option.name || ""}`
              }
              value={
                patients.find((p) => String(p.id) === String(patientId)) || null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  handlePatientChange(newValue.id);
                } else {
                  setPatientId("");
                  setPatientName("");
                  setVisits([]);
                  setVisitId("");
                  setMobile("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="PRN / Patient Name"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          {/* Visit Search */}

          <Grid item xs={12} md={4}>
            <Autocomplete
              sx={{ flex: 1, minWidth: "310px" }}
              autoHighlight
              options={visits}
              getOptionLabel={(option) =>
                `${option.visitNumber || ""} - ${option.doctorName || ""}`
              }
              value={
                visits.find((v) => String(v.id) === String(visitId)) || null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  handleVisitChange({
                    target: {
                      value: newValue.id,
                    },
                  });
                } else {
                  setVisitId("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Visit"
                  placeholder="Visit Number"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>

          {/* Mobile */}

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mobile Number"
              value={mobile || ""}
              InputProps={{
                readOnly: true,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Procedures
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={addProcedure}
            sx={{
              minWidth: 170,
              height: 50,

              borderRadius: "14px",
              textTransform: "none",

              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "0.3px",

              background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

              boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

              transition: "all 0.3s ease",

              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8, #0891B2)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
              },

              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Add Procedure
          </Button>
        </Box>

        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mt: 2,
          }}
        >
          <Box
            sx={{
              p: 1,
              background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              color: "#fff",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Selected Procedures
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead
                sx={{
                  background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
                }}
              >
                <TableRow
                  sx={{
                    backgroundColor: "#f1f5f9",
                  }}
                >
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Procedure
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Amount
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow
                    key={index}
                    hover
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <TableCell width="70%">
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={item.procedureId}
                        onChange={(e) =>
                          handleProcedureChange(index, e.target.value)
                        }
                      >
                        {procedures.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.procedureName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        color: "#16a34a",
                        fontSize: "16px",
                      }}
                    >
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => removeItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      align="center"
                      sx={{
                        py: 4,
                        color: "#64748b",
                        fontStyle: "italic",
                      }}
                    >
                      No Procedures Added
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        <Paper
          elevation={3}
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg,#ffffff,#f8fafc)",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Subtotal"
                value={`₹ ${Number(subtotal).toFixed(2)}`}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Discount"
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label="Payment Mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="INSURANCE">Insurance</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Final Amount"
                value={`₹ ${Number(finalAmount).toFixed(2)}`}
                InputProps={{
                  readOnly: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontWeight: "bold",
                    color: "green",
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              backgroundColor: "#f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="body1" color="text.secondary">
                Total Procedures
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {items.length}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body1" color="text.secondary">
                Grand Total
              </Typography>

              <Typography variant="h4" fontWeight="bold" color="success.main">
                ₹{Number(finalAmount).toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={saveBill}
              sx={{
                minWidth: 220,
                height: 55,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: "linear-gradient(135deg, #10B981, #059669)",

                boxShadow: "0 8px 24px rgba(16,185,129,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: "linear-gradient(135deg, #059669, #047857)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(16,185,129,0.35)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              Save Procedure Bill
            </Button>
          </Box>
        </Paper>
      </Paper>

        <Snackbar
              open={notification.open}
              autoHideDuration={3000}
              onClose={() =>
                setNotification({
                  ...notification,
                  open: false,
                })
              }
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Alert
                severity={notification.severity}
                variant="filled"
                sx={{ width: "100%" }}
              >
                {notification.message}
              </Alert>
            </Snackbar>
    </Box>
  );
}
