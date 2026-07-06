import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BedIcon from "@mui/icons-material/Bed";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [masterModal, setMasterModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);

  // Storage for global system values
  const [pricingMatrix, setPricingMatrix] = useState({});

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
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === "OCCUPIED").length;
  const availableBeds = beds.filter((b) => b.status === "VACANT").length;

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
    await api.post("/api/beds/assign", assignmentData);
    setAssignModal(false);
    setAssignmentData({
      patientId: "",
      patientName: "",
      visitId: "",
      visitNumber: "",
      bedId: null,
      admissionDate: new Date().toISOString().split("T")[0],
    });
    loadBeds();
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
    <Box sx={{ p: 4, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header & Stats Summary */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Chip
              icon={<BedIcon />}
              label={`Total: ${totalBeds}`}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              icon={<CheckCircleIcon color="success" />}
              label={`Available: ${availableBeds}`}
              color="success"
              variant="soft"
              sx={{
                fontWeight: 700,
                backgroundColor: "rgba(34, 197, 94, 0.1)",
              }}
            />
            <Chip
              icon={<ErrorIcon color="error" />}
              label={`Occupied: ${occupiedBeds}`}
              color="error"
              variant="soft"
              sx={{
                fontWeight: 700,
                backgroundColor: "rgba(239, 68, 68, 0.1)",
              }}
            />
          </Stack>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setMasterModal(true)}
          sx={{
            height: 50,
            px: 3,

            borderRadius: "14px",
            textTransform: "none",

            fontSize: "0.95rem",
            fontWeight: 700,

            background: "linear-gradient(135deg, #10B981, #059669)",

            boxShadow: "0 8px 24px rgba(16,185,129,0.25)",

            transition: "all 0.3s ease",

            "&:hover": {
              background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

              transform: "translateY(-2px)",

              boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
            },
          }}
        >
          Add New Bed
        </Button>
      </Box>

      {/* Grid of Beds */}
      <Grid container spacing={3}>
        {beds.map((bed) => {
          const style = getStatusStyle(bed.status);
          return (
            <Grid item xs={12} sm={6} md={3} key={bed.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${style.border}`,
                  boxShadow: "none",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                  {/* HEADER SECTION */}
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: style.bg,
                      borderBottom: `1px solid ${style.border}`,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, lineHeight: 1 }}
                    >
                      {bed.bedNumber}
                    </Typography>
                    <Chip
                      label={bed.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        color: style.color,
                        border: `1px solid ${style.color}`,
                        backgroundColor: "#fff",
                      }}
                    />
                  </Box>

                  {/* CONTENT BODY */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontWeight: 600 }}
                      >
                        {bed.roomType}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#1e3a8a", fontWeight: 700 }}
                      >
                        ₹{bed.pricePerDay} / Day
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    {bed.status === "VACANT" ? (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedBed(bed);
                          setAssignModal(true);

                          setAssignmentData({
                            ...assignmentData,
                            bedId: bed.id,
                          });
                        }}
                        sx={{
                          height: 42,

                          borderRadius: "12px",
                          textTransform: "none",

                          fontSize: "0.85rem",
                          fontWeight: 700,

                          background:
                            "linear-gradient(135deg, #1E40AF, #06B6D4)",

                          boxShadow: "0 6px 18px rgba(30,64,175,0.25)",

                          transition: "all 0.3s ease",

                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #1D4ED8, #0891B2)",

                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        Assign Patient
                      </Button>
                    ) : (
                      <Box>
                        {/* OCCUPIED PATIENT BLOCK */}
                        <Box
                          sx={{
                            backgroundColor: "#fff5f5",
                            border: "1px solid #fecaca",
                            borderRadius: 3,
                            p: 1.5,
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              fontWeight: 800,
                              color: "#dc2626",
                              mb: 0.5,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Occupied By
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "#111827", mb: 1 }}
                          >
                            {bed.patientName || "Unknown Patient"}
                          </Typography>

                          {/* METADATA ROWS */}
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748b" }}
                              >
                                PRN:
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#111827", fontWeight: 600 }}
                              >
                                {bed.patientId
                                  ? `PRN${String(bed.patientId).padStart(4, "0")}`
                                  : "-"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#64748b" }}
                              >
                                Admitted:
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#111827", fontWeight: 600 }}
                              >
                                {bed.admissionDate
                                  ? new Date(
                                      bed.admissionDate,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "-"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mt: 0.5,
                                pt: 0.5,
                                borderTop: "1px dashed #fecaca",
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "#dc2626", fontWeight: 700 }}
                              >
                                Total Stay:
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#dc2626", fontWeight: 700 }}
                              >
                                {bed.admissionDate
                                  ? `${Math.max(1, Math.ceil((new Date().getTime() - new Date(bed.admissionDate).getTime()) / (1000 * 60 * 60 * 24)))} Day(s)`
                                  : "-"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* ACTION BUTTON */}
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          onClick={() => handleDischarge(bed.id)}
                          sx={{
                            height: 42,

                            borderRadius: "12px",
                            textTransform: "none",

                            fontSize: "0.85rem",
                            fontWeight: 700,

                            borderWidth: 2,

                            transition: "all 0.3s ease",

                            "&:hover": {
                              backgroundColor: "#FEF2F2",
                              borderColor: "#DC2626",
                              color: "#DC2626",

                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          Discharge Patient
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
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

      {/* MODAL: ASSIGN PATIENT */}
      <Dialog
        open={assignModal}
        onClose={() => setAssignModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1e3a8a" }}>
          Admit to {selectedBed?.bedNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {/* PATIENT */}

            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                autoHighlight
                options={patients}
                getOptionLabel={(option) =>
                  `${option.patientCode || `PRN${String(option.id).padStart(4, "0")}`} - ${option.name || ""}`
                }
                value={
                  patients.find(
                    (p) => String(p.id) === String(assignmentData.patientId),
                  ) || null
                }
                onChange={async (event, newValue) => {
                  if (newValue) {
                    setAssignmentData((prev) => ({
                      ...prev,
                      patientId: newValue.id,
                      patientName: newValue.name,
                      visitId: "",
                      visitNumber: "",
                    }));

                    await loadActiveVisits(newValue.id);
                  } else {
                    setAssignmentData((prev) => ({
                      ...prev,
                      patientId: "",
                      patientName: "",
                      visitId: "",
                      visitNumber: "",
                    }));

                    setVisits([]);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Patient"
                    placeholder="Type PRN / Patient Name"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </FormControl>

            {/* VISIT */}

            <FormControl fullWidth>
              <Autocomplete
                fullWidth
                autoHighlight
                options={visits}
                disabled={visits.length === 0}
                getOptionLabel={(option) => option.visitNumber || ""}
                value={
                  visits.find(
                    (v) => String(v.id) === String(assignmentData.visitId),
                  ) || null
                }
                onChange={(event, newValue) => {
                  if (newValue) {
                    setAssignmentData((prev) => ({
                      ...prev,
                      visitId: newValue.id,
                      visitNumber: newValue.visitNumber,
                    }));
                  } else {
                    setAssignmentData((prev) => ({
                      ...prev,
                      visitId: "",
                      visitNumber: "",
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Visit"
                    placeholder="Type Visit Number"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            </FormControl>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={assignmentData.admissionDate}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  admissionDate: e.target.value,
                })
              }
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
            onClick={() => setAssignModal(false)}
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
            onClick={handleAssignSubmit}
            sx={{
              minWidth: 160,
              height: 44,

              borderRadius: "12px",
              textTransform: "none",

              fontSize: "0.9rem",
              fontWeight: 700,

              background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

              boxShadow: "0 8px 20px rgba(30,64,175,0.25)",

              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8, #0891B2)",

                transform: "translateY(-2px)",
              },
            }}
          >
            Admit Patient
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
