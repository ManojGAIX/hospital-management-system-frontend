import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BedIcon from "@mui/icons-material/Bed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PrintIcon from "@mui/icons-material/Print";
import api from "../services/api";

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [masterModal, setMasterModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [admittedPage, setAdmittedPage] = useState(0);

  // Storage for global system values
  const [pricingMatrix, setPricingMatrix] = useState({});
  const [admissionPaymentMode, setAdmissionPaymentMode] = useState("CASH");
  const [admissionSplitPayment, setAdmissionSplitPayment] = useState({ cashAmount: "", upiAmount: "", cardAmount: "" });

  const [newBed, setNewBed] = useState({
    bedNumber: "",
    roomType: "GENERAL",
    pricePerDay: "",
  });

  const [assignmentData, setAssignmentData] = useState({
    patientId: "",
    patientName: "",
    visitId: "",
    visitNumber: "",
    bedId: null,
    admissionDate: new Date().toISOString().split("T")[0],
  });

  const [visits, setVisits] = useState([]);

  useEffect(() => {
    loadBeds();
    loadPatients();
    loadPricingConfigurations();
  }, []);

  const loadBeds = async () => {
    const res = await api.get("/api/beds");
    setBeds(res.data);
  };

  const loadPatients = async () => {
    const res = await api.get("/api/patients");
    setPatients(res.data.data || []);
  };

  // FETCH MASTER DATABASE CONFIGURATIONS
  const loadPricingConfigurations = async () => {
    try {
      const res = await api.get("/api/configs");
      const configArray = Array.isArray(res.data) ? res.data : [];

      // Reduce system settings configurations array into a clean dictionary
      const pricingMap = configArray.reduce((acc, curr) => {
        acc[curr.configKey] = curr.configValue;
        return acc;
      }, {});

      setPricingMatrix(pricingMap);

      // Set the initial price for the default GENERAL ward type selection
      setNewBed((prev) => ({
        ...prev,
        pricePerDay: pricingMap["BED_GENERAL"] || "0",
      }));
    } catch (err) {
      console.error("Failed to query global parameters:", err);
    }
  };

  // HANDLE ROOM TYPE DROP-DOWN UPDATE & AUTO PRICE LOOKUP
  const handleRoomTypeChange = (type) => {
    const configKey = `BED_${type.toUpperCase()}`;
    const mappedPrice = pricingMatrix[configKey] || "0";

    setNewBed({
      ...newBed,
      roomType: type,
      pricePerDay: mappedPrice,
    });
  };

  // --- STATS CALCULATION ---
  const admissionFee = Number(
    pricingMatrix.IPD_ADMISSION_FEE ||
      pricingMatrix.ADMISSION_FEE ||
      pricingMatrix.IPD_ADMISSION_CHARGE ||
      pricingMatrix.ADMISSION_CHARGE ||
      0,
  );
  const admissionSplitTotal = Object.values(admissionSplitPayment).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableBeds = beds.filter((b) => b.status === "VACANT").length;
  const admittedPatients = beds.filter((b) => b.status === "OCCUPIED");
  const admittedRowsPerPage = 5;
  const paginatedAdmittedPatients = admittedPatients.slice(
    admittedPage * admittedRowsPerPage,
    admittedPage * admittedRowsPerPage + admittedRowsPerPage,
  );

  const handleCreateBed = async () => {
    if (!newBed.bedNumber) return alert("Please provide a valid Bed Number");
    await api.post("/api/beds", newBed);
    setMasterModal(false);
    setNewBed({
      bedNumber: "",
      roomType: "GENERAL",
      pricePerDay: pricingMatrix["BED_GENERAL"] || "0",
    });
    loadBeds();
  };

  const handleAssignSubmit = async () => {
    if (!assignmentData.patientId) return alert("Please select a patient");
    if (admissionPaymentMode === "SPLIT" && Math.abs(admissionSplitTotal - admissionFee) > 0.01) {
      return alert("Split payment total must equal the admission fee.");
    }

    const admissionPayload = {
      ...assignmentData,
      admissionFee,
      paymentMode: admissionPaymentMode,
      cashAmount: admissionPaymentMode === "SPLIT" ? Number(admissionSplitPayment.cashAmount || 0) : 0,
      upiAmount: admissionPaymentMode === "SPLIT" ? Number(admissionSplitPayment.upiAmount || 0) : 0,
      cardAmount: admissionPaymentMode === "SPLIT" ? Number(admissionSplitPayment.cardAmount || 0) : 0,
    };
    await api.post("/api/beds/assign", admissionPayload);
    setAssignmentData({
      patientId: "",
      patientName: "",
      visitId: "",
      visitNumber: "",
      bedId: null,
      admissionDate: new Date().toISOString().split("T")[0],
    });
    setAdmissionPaymentMode("CASH");
    setAdmissionSplitPayment({ cashAmount: "", upiAmount: "", cardAmount: "" });
    setSelectedBed(null);
    loadBeds();
  };

  const handlePrintAdmissionReceipt = (bed) => {
    const receiptWindow = window.open("", "_blank", "width=760,height=900");
    if (!receiptWindow) return;

    const admissionDate = bed.admissionDate
      ? new Date(bed.admissionDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "-";
    const admissionAmount = Number(bed.admissionFee || admissionFee).toFixed(2);

    receiptWindow.document.write(`
      <!doctype html>
      <html><head><title>Admission Fee Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 36px; color: #172554; }
        .receipt { max-width: 680px; margin: auto; border: 1px solid #bfdbfe; border-radius: 14px; overflow: hidden; }
        header { background: #1e40af; color: #fff; padding: 24px; }
        h1 { margin: 0; font-size: 24px; } p { margin: 6px 0 0; }
        .content { padding: 24px; } .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .label { color: #64748b; } .amount { font-size: 20px; font-weight: 800; color: #047857; }
        footer { padding: 18px 24px; color: #64748b; font-size: 12px; }
      </style></head><body>
        <section class="receipt"><header><h1>Admission Fee Receipt</h1><p>Ward & Bed Management</p></header>
        <div class="content">
          <div class="row"><span class="label">Patient</span><strong>${bed.patientName || "-"}</strong></div>
          <div class="row"><span class="label">PRN</span><strong>${bed.patientId ? `PRN${String(bed.patientId).padStart(4, "0")}` : "-"}</strong></div>
          <div class="row"><span class="label">Bed / Ward</span><strong>${bed.bedNumber || "-"} / ${bed.roomType || "-"}</strong></div>
          <div class="row"><span class="label">Admission Date</span><strong>${admissionDate}</strong></div>
          <div class="row"><span class="label">Payment Mode</span><strong>${bed.paymentMode || "CASH"}</strong></div>
          <div class="row"><span class="label">Admission Fee</span><strong class="amount">₹${admissionAmount}</strong></div>
        </div><footer>Generated on ${new Date().toLocaleString("en-IN")}</footer></section>
        <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    receiptWindow.document.close();
  };
  const handleDischarge = async (bedId) => {
    if (window.confirm("Confirm discharge and generate final bill?")) {
      const res = await api.post(`/api/beds/discharge/${bedId}`);
      alert(res.data);
      loadBeds();
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "VACANT":
        return {
          color: "#22c55e",
          bg: "rgba(34, 197, 94, 0.1)",
          border: "#bbf7d0",
        };
      case "OCCUPIED":
        return {
          color: "#ef4444",
          bg: "rgba(239, 68, 68, 0.1)",
          border: "#fecaca",
        };
      default:
        return {
          color: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.1)",
          border: "#fef3c7",
        };
    }
  };

  const loadActiveVisits = async (patientId) => {
    try {
      const res = await api.get(
        `/api/visits/active/${patientId}`,
      );
      setVisits(res.data);

      if (res.data.length > 0) {
        const latestVisit = res.data[0];
        setAssignmentData((prev) => ({
          ...prev,
          visitId: latestVisit.id,
          visitNumber: latestVisit.visitNumber,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <Chip icon={<BedIcon />} label={`Total: ${totalBeds}`} variant="outlined" sx={{ fontWeight: 700 }} />
          <Chip icon={<CheckCircleIcon />} label={`Available: ${availableBeds}`} sx={{ fontWeight: 700, bgcolor: "#dcfce7", color: "#166534" }} />
          <Chip icon={<ErrorIcon />} label={`Occupied: ${occupiedBeds}`} sx={{ fontWeight: 700, bgcolor: "#fee2e2", color: "#b91c1c" }} />
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setMasterModal(true)} sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, height: 48, px: 3, borderRadius: 2, textTransform: "none", fontWeight: 800, bgcolor: "#059669" }}>
          Add New Bed
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, border: "1px solid #dbe4f0", borderRadius: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2854" }}>Bed Availability</Typography>
            <Typography variant="body2" sx={{ color: "#587196", mt: 0.5 }}>Choose a vacant bed to begin a patient admission.</Typography>
          </Box>
          <Chip label={`${availableBeds} Vacant`} color="success" size="small" sx={{ fontWeight: 700 }} />
        </Box>
        <Grid container spacing={2}>
          {beds.map((bed) => {
            const style = getStatusStyle(bed.status);
            const isSelected = selectedBed?.id === bed.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={bed.id}>
                <Card sx={{ height: "100%", borderRadius: 3, border: `1px solid ${isSelected ? "#2563eb" : style.border}`, boxShadow: isSelected ? "0 0 0 2px #bfdbfe" : "none" }}>
                  <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                    <Box sx={{ p: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: style.bg, borderBottom: `1px solid ${style.border}` }}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>{bed.bedNumber}</Typography>
                      <Chip label={bed.status} size="small" sx={{ fontWeight: 800, color: style.color, bgcolor: "#fff", border: `1px solid ${style.color}` }} />
                    </Box>
                    <Box sx={{ p: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>{bed.roomType}</Typography>
                        <Typography variant="body2" sx={{ color: "#1e3a8a", fontWeight: 800 }}>₹{Number(bed.pricePerDay || 0).toFixed(2)}/day</Typography>
                      </Box>
                      {bed.status === "VACANT" ? (
                        <Button fullWidth variant="contained" onClick={() => { setSelectedBed(bed); setAssignmentData((prev) => ({ ...prev, bedId: bed.id })); }} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800 }}>
                          {isSelected ? "Selected" : "Assign Patient"}
                        </Button>
                      ) : (
                        <Box sx={{ bgcolor: "#fff5f5", border: "1px solid #fecaca", borderRadius: 2, p: 1.25 }}>
                          <Typography variant="caption" sx={{ color: "#dc2626", fontWeight: 800 }}>OCCUPIED BY</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.25 }}>{bed.patientName || "Unknown Patient"}</Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>{bed.patientId ? `PRN${String(bed.patientId).padStart(4, "0")}` : "-"}</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid #dbe4f0", borderRadius: 3, position: { lg: "sticky" }, top: 20 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2854" }}>Patient Admission</Typography>
            <Typography variant="body2" sx={{ color: "#587196", mt: 0.5, mb: 2.5 }}>Select a vacant bed above, then enter admission details.</Typography>
            <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: selectedBed ? "#eff6ff" : "#f8fafc", border: "1px solid", borderColor: selectedBed ? "#bfdbfe" : "#e2e8f0" }}>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 800 }}>SELECTED BED</Typography>
              <Typography sx={{ fontWeight: 800, color: "#1e3a8a", mt: 0.25 }}>{selectedBed ? `${selectedBed.bedNumber} · ${selectedBed.roomType}` : "Choose a vacant bed"}</Typography>
            </Box>
            <Stack spacing={2}>
              <Autocomplete fullWidth options={patients} getOptionLabel={(option) => `${option.patientCode || `PRN${String(option.id).padStart(4, "0")}`} - ${option.name || ""}`} value={patients.find((p) => String(p.id) === String(assignmentData.patientId)) || null} onChange={async (event, newValue) => {
                if (newValue) {
                  setAssignmentData((prev) => ({ ...prev, patientId: newValue.id, patientName: newValue.name, visitId: "", visitNumber: "" }));
                  await loadActiveVisits(newValue.id);
                } else {
                  setAssignmentData((prev) => ({ ...prev, patientId: "", patientName: "", visitId: "", visitNumber: "" }));
                  setVisits([]);
                }
              }} renderInput={(params) => <TextField {...params} label="Search Patient" placeholder="Type PRN / Patient Name" />} isOptionEqualToValue={(option, value) => option.id === value.id} />
              <Autocomplete fullWidth options={visits} disabled={visits.length === 0} getOptionLabel={(option) => option.visitNumber || ""} value={visits.find((v) => String(v.id) === String(assignmentData.visitId)) || null} onChange={(event, newValue) => setAssignmentData((prev) => ({ ...prev, visitId: newValue?.id || "", visitNumber: newValue?.visitNumber || "" }))} renderInput={(params) => <TextField {...params} label="Search Visit" placeholder="Type Visit Number" />} isOptionEqualToValue={(option, value) => option.id === value.id} />
              <TextField label="Admission Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={assignmentData.admissionDate} onChange={(e) => setAssignmentData({ ...assignmentData, admissionDate: e.target.value })} />
              <Box sx={{ p: 1.5, border: "1px dashed #bfdbfe", borderRadius: 2, bgcolor: "#f8fbff" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#1e3a8a", mb: 1 }}>Admission Fee: ₹{admissionFee.toFixed(2)}</Typography>
                <FormControl fullWidth size="small"><InputLabel>Payment Mode</InputLabel><Select value={admissionPaymentMode} label="Payment Mode" onChange={(e) => setAdmissionPaymentMode(e.target.value)}><MenuItem value="CASH">Cash</MenuItem><MenuItem value="UPI">UPI</MenuItem><MenuItem value="CARD">Card</MenuItem><MenuItem value="SPLIT">Split Payment</MenuItem><MenuItem value="PAY_LATER">Charge to IPD Bill</MenuItem></Select></FormControl>
                {admissionPaymentMode === "SPLIT" && <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}><TextField size="small" type="number" label="Cash" value={admissionSplitPayment.cashAmount} onChange={(e) => setAdmissionSplitPayment({ ...admissionSplitPayment, cashAmount: e.target.value })} inputProps={{ min: 0 }} sx={{ flex: 1, minWidth: 90 }} /><TextField size="small" type="number" label="UPI" value={admissionSplitPayment.upiAmount} onChange={(e) => setAdmissionSplitPayment({ ...admissionSplitPayment, upiAmount: e.target.value })} inputProps={{ min: 0 }} sx={{ flex: 1, minWidth: 90 }} /><TextField size="small" type="number" label="Card" value={admissionSplitPayment.cardAmount} onChange={(e) => setAdmissionSplitPayment({ ...admissionSplitPayment, cardAmount: e.target.value })} inputProps={{ min: 0 }} sx={{ flex: 1, minWidth: 90 }} /><Typography variant="caption" sx={{ width: "100%", color: Math.abs(admissionSplitTotal - admissionFee) <= 0.01 ? "success.main" : "error.main" }}>Split total: ₹{admissionSplitTotal.toFixed(2)} / ₹{admissionFee.toFixed(2)}</Typography></Box>}
              </Box>
              <Button variant="contained" fullWidth disabled={!selectedBed} onClick={handleAssignSubmit} sx={{ height: 48, borderRadius: 2, textTransform: "none", fontWeight: 800 }}>{selectedBed ? `Admit to ${selectedBed.bedNumber}` : "Select a Bed to Admit"}</Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={0} sx={{ border: "1px solid #dbe4f0", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap", borderBottom: "1px solid #e2e8f0" }}>
              <Box><Typography variant="h5" sx={{ fontWeight: 800, color: "#0f2854" }}>Admitted Patient Directory</Typography><Typography variant="body2" sx={{ color: "#587196", mt: 0.5 }}>Admission fee receipts and current bed occupancy.</Typography></Box>
              <Chip label={`${admittedPatients.length} Admitted`} size="small" color="error" sx={{ fontWeight: 700 }} />
            </Box>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead><TableRow sx={{ bgcolor: "#1e40af" }}>{["Patient", "PRN", "Bed", "Ward", "Admitted", "Stay", "Actions"].map((heading) => <TableCell key={heading} sx={{ color: "#fff", fontWeight: 800, whiteSpace: "nowrap" }}>{heading}</TableCell>)}</TableRow></TableHead>
                <TableBody>
                  {paginatedAdmittedPatients.length === 0 ? <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#64748b" }}>No patients are currently admitted.</TableCell></TableRow> : paginatedAdmittedPatients.map((bed) => {
                    const stayDays = bed.admissionDate ? Math.max(1, Math.ceil((new Date().getTime() - new Date(bed.admissionDate).getTime()) / 86400000)) : 0;
                    return <TableRow key={bed.id} hover><TableCell sx={{ fontWeight: 700 }}>{bed.patientName || "Unknown Patient"}</TableCell><TableCell>{bed.patientId ? `PRN${String(bed.patientId).padStart(4, "0")}` : "-"}</TableCell><TableCell sx={{ fontWeight: 800, color: "#1e3a8a" }}>{bed.bedNumber}</TableCell><TableCell>{bed.roomType}</TableCell><TableCell>{bed.admissionDate ? new Date(bed.admissionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</TableCell><TableCell>{stayDays ? `${stayDays} Day(s)` : "-"}</TableCell><TableCell sx={{ whiteSpace: "nowrap" }}><Button size="small" startIcon={<PrintIcon />} onClick={() => handlePrintAdmissionReceipt(bed)} sx={{ textTransform: "none", fontWeight: 700 }}>Receipt</Button><Button size="small" color="error" onClick={() => handleDischarge(bed.id)} sx={{ textTransform: "none", fontWeight: 700 }}>Discharge</Button></TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination component="div" count={admittedPatients.length} page={admittedPage} onPageChange={(event, page) => setAdmittedPage(page)} rowsPerPage={admittedRowsPerPage} rowsPerPageOptions={[admittedRowsPerPage]} />
          </Paper>
        </Grid>
      </Grid>
      {/* MODAL: CREATE BED */}
      <Dialog
        open={masterModal}
        onClose={() => setMasterModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Add Master Bed</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Bed Number"
              placeholder="GW-01"
              fullWidth
              value={newBed.bedNumber}
              onChange={(e) =>
                setNewBed({ ...newBed, bedNumber: e.target.value })
              }
            />
            <TextField
              select
              label="Room Type"
              fullWidth
              value={newBed.roomType}
              onChange={(e) => handleRoomTypeChange(e.target.value)}
            >
              <MenuItem value="GENERAL">General Ward</MenuItem>
              <MenuItem value="PRIVATE">Private Room</MenuItem>
              <MenuItem value="ICU">ICU</MenuItem>
            </TextField>
            <TextField
              label="Price Per Day (₹)"
              type="number"
              fullWidth
              value={newBed.pricePerDay}
              disabled
              helperText="Managed globally within System Settings panel parameters."
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => setMasterModal(false)}
            sx={{
              height: 44,
              px: 3,

              borderRadius: "12px",
              textTransform: "none",

              fontSize: "0.9rem",
              fontWeight: 700,

              color: "#EF4444",

              "&:hover": {
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateBed}
            sx={{
              minWidth: 140,
              height: 44,

              borderRadius: "12px",
              textTransform: "none",

              fontSize: "0.9rem",
              fontWeight: 700,

              background: "linear-gradient(135deg, #10B981, #059669)",

              boxShadow: "0 8px 20px rgba(16,185,129,0.25)",

              "&:hover": {
                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                transform: "translateY(-2px)",
              },
            }}
          >
            Save Bed
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
