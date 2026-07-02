import React, { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
  Autocomplete,
} from "@mui/material";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";

const API = "/api/physio";

export default function PhysioManagement() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dashboard, setDashboard] = useState({
    todaySessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    revenue: 0,
  });

  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    therapistName: "",
    therapyType: "",
    sessionDate: new Date().toISOString().split("T")[0],
    exercises: "",
    romProgress: "",
    painScore: "",
    remarks: "",
    status: "PENDING",
    sessionFees: "",
  });

  useEffect(() => {
    loadSessions();
    loadDashboard();
    loadPatients();
    loadTherapists();
    loadTherapyTypes();
  }, []);

  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [therapyTypes, setTherapyTypes] = useState([]);

  // const [formData, setFormData] = useState({
  //   patientId: "",
  //   patientName: "",
  //   visitId: "",

  //   therapistName: "",

  //   therapyType: "",
  //   sessionFees: 0,

  //   sessionDate: "",

  //   exercises: "",
  //   romProgress: "",

  //   status: "PENDING",
  // });

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/physio/patients");

      console.log("PATIENT API RESPONSE:", res.data);

      setPatients(res.data);
    } catch (err) {
      console.error("PATIENT API ERROR:", err);
    }
  };

  const loadTherapists = async () => {
    try {
      const res = await api.get("/api/doctors");

      setTherapists(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTherapyTypes = async () => {
    try {
      const res = await api.get("/api/configs");

      const filteredTypes = res.data.filter((c) =>
        c.configKey.startsWith("PHYSIO_"),
      );

      setTherapyTypes(filteredTypes);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSessions = async () => {
    try {
      const res = await api.get(API);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load sessions");
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await api.get(`${API}/dashboard`);
      console.log("Dashboard Response:", res.data);
      setDashboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = () => {
    setSelectedId(null);

    setFormData({
      patientId: "",
      patientName: "",
      therapistName: "",
      therapyType: "",
      sessionDate: new Date().toISOString().split("T")[0],
      exercises: "",
      romProgress: "",
      painScore: "",
      remarks: "",
      status: "PENDING",
      sessionFees: "",
    });

    setOpen(true);
  };

  const handleEdit = (row) => {
    setSelectedId(row.id);
    setFormData(row);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedId) {
        console.log("Saving:", formData);
        await api.put(`${API}/${selectedId}`, formData);
      } else {
        console.log("Saving:", formData);
        await api.post(API, formData);
      }

      setOpen(false);
      loadSessions();
      loadDashboard();
    } catch (err) {
      console.error(err);
      setError("Failed to save session");
    }
  };

  const confirmDelete = (id) => {
    setSelectedId(id);
    setDeleteOpen(true);
  };

  const deleteSession = async () => {
    try {
      await api.delete(`${API}/${selectedId}`);

      setDeleteOpen(false);

      loadSessions();
      loadDashboard();
    } catch (err) {
      console.error(err);
      setError("Delete failed");
    }
  };

  const filtered = sessions.filter((s) =>
    (s.patientName || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleTherapyChange = (e) => {
    const therapyKey = e.target.value;

    const selected = therapyTypes.find((t) => t.configKey === therapyKey);

    setFormData({
      ...formData,
      therapyType: therapyKey,

      sessionFees: Number(selected?.configValue || 0),
    });
  };

  const handleTherapistChange = (e) => {
    setFormData({
      ...formData,
      therapistName: e.target.value,
    });
  };

  const handlePatientChange = (event) => {
    const selectedId = event.target.value;

    const selectedPatient = patients.find((p) => p.id === selectedId);

    console.log("Selected Patient:", selectedPatient);

    setFormData((prev) => ({
      ...prev,
      patientId: selectedId,
      patientName: selectedPatient?.name || "",
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            minWidth: 170,
            height: 50,

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

              boxShadow: "0 12px 28px rgba(30,64,175,0.30)",
            },

            "&:active": {
              transform: "scale(0.98)",
            },
          }}
        >
          New Session
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* DASHBOARD */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              minWidth: 180,
              height: 140,
              //  width: "100%",
              borderRadius: 3,
              color: "#fff",
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              boxShadow: 4,
              display: "flex",
              alignItems: "center",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Today's Sessions
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {dashboard.todaySessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              minWidth: 180,
              height: 140,
              //  width: "100%",
              borderRadius: 3,
              color: "#fff",
              background: "linear-gradient(135deg, #2e7d32, #66bb6a)",
              boxShadow: 4,
              display: "flex",
              alignItems: "center",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Completed
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {dashboard.completedSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              minWidth: 180,
              height: 140,
              //  width: "100%",
              borderRadius: 3,
              color: "#fff",
              background: "linear-gradient(135deg, #ed6c02, #ffb74d)",
              boxShadow: 4,
              display: "flex",
              alignItems: "center",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Pending
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {dashboard.pendingSessions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              minWidth: 180,
              height: 140,
              //  width: "100%",
              borderRadius: 3,
              color: "#fff",
              background: "linear-gradient(135deg, #6a1b9a, #ab47bc)",
              boxShadow: 4,
              display: "flex",
              alignItems: "center",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: 8,
              },
            }}
          >
            <CardContent sx={{ width: "100%" }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Revenue
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                ₹{dashboard.revenue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SEARCH */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Search Patient"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead
            sx={{ background: "linear-gradient(90deg,#1E40AF,#3B82F6)" }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                SI No
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>Patient</TableCell>

              <TableCell sx={{ color: "#fff" }}>Therapist</TableCell>

              <TableCell sx={{ color: "#fff" }}>Therapy</TableCell>

              <TableCell sx={{ color: "#fff" }}>ROM</TableCell>

              <TableCell sx={{ color: "#fff" }}>Fees</TableCell>

              <TableCell sx={{ color: "#fff" }}>Status</TableCell>

              <TableCell sx={{ color: "#fff" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell>{row.patientName}</TableCell>

                  <TableCell>{row.therapistName}</TableCell>

                  <TableCell>{row.therapyType}</TableCell>

                  <TableCell>{row.romProgress}</TableCell>

                  <TableCell>₹{row.sessionFees}</TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      color={
                        row.status === "COMPLETED"
                          ? "success"
                          : row.status === "CANCELLED"
                            ? "error"
                            : "warning"
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      color="error"
                      onClick={() => confirmDelete(row.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No Sessions Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      {/* ADD / EDIT DIALOG */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedId ? "Edit Session" : "New Session"}</DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "#fafafa",
            }}
          >
            {/* Row 1 */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <FormControl
                sx={{
                  flex: 1,
                  minWidth: 250,
                }}
              >
                <Autocomplete
                  size="small"
                  options={patients}
                  value={
                    patients.find(
                      (p) => String(p.id) === String(formData.patientId),
                    ) || null
                  }
                  getOptionLabel={(option) =>
                    `${option.patientCode || `PRN${String(option.id).padStart(4, "0")}`} - ${option.name || ""}`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(event, newValue) => {
                    handlePatientChange({
                      target: {
                        value: newValue ? newValue.id : "",
                      },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Patient"
                      placeholder="Type PRN / Name"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div>
                        <strong>
                          {option.patientCode ||
                            `PRN${String(option.id).padStart(4, "0")}`}
                        </strong>
                        {" - "}
                        {option.name}
                        <br />
                        <small>{option.phone || ""}</small>
                      </div>
                    </li>
                  )}
                />
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 250 }} size="small">
                <InputLabel>Therapist</InputLabel>
                <Select
                  value={formData.therapistName}
                  label="Therapist"
                  onChange={handleTherapistChange}
                >
                  {therapists.map((d) => (
                    <MenuItem key={d.id} value={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ flex: 1, minWidth: 250 }} size="small">
                <InputLabel>Therapy Type</InputLabel>
                <Select
                  value={formData.therapyType}
                  label="Therapy Type"
                  onChange={handleTherapyChange}
                >
                  {therapyTypes.map((t) => (
                    <MenuItem key={t.id} value={t.configKey}>
                      {t.configKey.replace("PHYSIO_", "")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Row 2 */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="Session Fees"
                value={formData.sessionFees}
                InputProps={{ readOnly: true }}
                size="small"
                sx={{ flex: 1, minWidth: 250 }}
              />

              <TextField
                label="Session Date"
                type="date"
                size="small"
                value={formData.sessionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessionDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 250 }}
              />

              <FormControl sx={{ flex: 1, minWidth: 250 }} size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Row 3 */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="ROM Progress"
              value={formData.romProgress}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  romProgress: e.target.value,
                })
              }
            />
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => setOpen(false)}
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
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              minWidth: 130,
              height: 44,

              borderRadius: "12px",
              textTransform: "none",

              fontSize: "0.9rem",
              fontWeight: 700,

              background: "linear-gradient(135deg, #10B981, #059669)",

              boxShadow: "0 8px 20px rgba(16,185,129,0.25)",

              transition: "all 0.3s ease",

              "&:hover": {
                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                transform: "translateY(-2px)",

                boxShadow: "0 12px 28px rgba(30,64,175,0.30)",
              },

              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Session</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this session?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>

          <Button color="error" variant="contained" onClick={deleteSession}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
