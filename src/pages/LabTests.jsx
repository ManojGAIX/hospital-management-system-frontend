import React, { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  TablePagination,
  Grid,
  Autocomplete,
  Divider,
} from "@mui/material";
import api from "../services/api";

import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

import { getPatients } from "../api/patientApi";
import { getLabTests, createLabTest, deleteLabTest } from "../api/labTestApi";
import { formatDateTime } from "../utils/dateFormatter";

export default function LabTests() {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [configList, setConfigList] = useState([]);

  // Form States
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [testName, setTestName] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [visits, setVisits] = useState([]);
  const [selectedVisitId, setSelectedVisitId] = useState("");
  const [visitNumber, setVisitNumber] = useState("");

  useEffect(() => {
    loadPatients();
    loadTests();
    loadConfigs();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTests = async () => {
    try {
      const res = await getLabTests();
      const sortedTests = (res.data || []).sort(
        (a, b) => Number(b.id) - Number(a.id),
      );
      setTests(sortedTests);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConfigs = async () => {
    try {
      const res = await api.get("/api/configs/category/LAB");

      setConfigList(res.data);
    } catch (err) {
      console.error("Error loading configs:", err);
    }
  };

  const handlePatientChange = async (value) => {
    if (!value) return;
    setPatientId(value);

    const currentPatient = patients.find((p) => String(p.id) === String(value));
    const capturedName = currentPatient ? currentPatient.name : "";
    setPatientName(capturedName);

    try {
      const response = await api.get(`/api/visits/active/${value}`);
      const activeVisits = response.data || [];
      setVisits(activeVisits);

      if (activeVisits.length > 0) {
        setSelectedVisitId(activeVisits[0].id);
        setVisitNumber(activeVisits[0].visitNumber);
      } else {
        setSelectedVisitId("");
        setVisitNumber("");
      }
    } catch (error) {
      console.error("Failed to load visits", error);
      setVisits([]);
      setSelectedVisitId("");
      setVisitNumber("");
    }
  };

  const handleTestChange = (selectedKey) => {
    setTestName(selectedKey);
    const selectedConfig = configList.find((c) => c.configKey === selectedKey);
    setAmount(selectedConfig ? selectedConfig.configValue : 0);
  };

  const handleSubmit = async () => {
    let finalPatientName = patientName;
    if (!finalPatientName && patientId) {
      const p = patients.find((item) => String(item.id) === String(patientId));
      if (p) finalPatientName = p.name;
    }

    if (!patientId || !testName || !testDate || !finalPatientName) {
      alert("Please fill all fields, including Patient selection.");
      return;
    }

    const payload = {
      patientId: Number(patientId),
      visitId: selectedVisitId ? Number(selectedVisitId) : null,
      visitNumber: visitNumber || "N/A",
      patientName: finalPatientName,
      testName: testName.replace(/_/g, " "),
      amount: Number(amount || 0),
      result: result ? result.toUpperCase() : "PENDING",
      testDate: testDate,
      billed: false,
    };

    try {
      // Direct JSON post body upload
      await api.get("/api/labtests", payload);
      alert("Lab test record added successfully!");
      resetForm();
      loadTests();
    } catch (err) {
      console.error(err);
      alert("Error saving record: " + (err.response?.data || err.message));
    }
  };

  const resetForm = () => {
    setPatientId("");
    setPatientName("");
    setTestName("");
    setAmount("");
    setResult("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setSelectedVisitId("");
    setVisitNumber("");
    setVisits([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this test record?")) {
      try {
        await deleteLabTest(id);
        loadTests();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredTests = tests.filter((t) => {
    const pName = t.patientName?.toLowerCase() || "";
    const prn = `prn${String(t.patientId).padStart(4, "0")}`;
    const tName = t.testName?.toLowerCase() || "";
    return (
      pName.includes(search.toLowerCase()) ||
      prn.includes(search.toLowerCase()) ||
      tName.includes(search.toLowerCase())
    );
  });

  return (
    <Box
      sx={{ padding: "10px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
    >
      {/* PERFECTLY ALIGNED FORM GRID */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,

          background: "rgba(255,255,255,0.75)",

          backdropFilter: "blur(12px)",

          border: "1px solid rgba(255,255,255,0.4)",

          boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* PATIENT */}

          <FormControl fullWidth sx={{ flex: 1, minWidth: "250px" }}>
            <Autocomplete
              fullWidth
              autoHighlight
              options={patients}
              getOptionLabel={(option) =>
                `${option.patientCode || `PRN${String(option.id).padStart(4, "0")}`} - ${option.name || ""}`
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
                  setSelectedVisitId("");
                  setVisitNumber("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Type PRN / Name"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </FormControl>

          {/* VISIT */}

          <FormControl fullWidth sx={{ flex: 1, minWidth: "220px" }}>
            <Autocomplete
              fullWidth
              autoHighlight
              options={visits}
              getOptionLabel={(option) => option.visitNumber || ""}
              value={
                visits.find((v) => String(v.id) === String(selectedVisitId)) ||
                null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  setSelectedVisitId(newValue.id);
                  setVisitNumber(newValue.visitNumber);
                } else {
                  setSelectedVisitId("");
                  setVisitNumber("");
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
              disabled={visits.length === 0}
            />
          </FormControl>

          {/* DYNAMIC DROPDOWN FROM CONFIGS */}
          <FormControl sx={{ flex: 1, minWidth: "220px" }}>
            <InputLabel>Test Name</InputLabel>
            <Select
              value={testName}
              label="Test Name"
              onChange={(e) => handleTestChange(e.target.value)}
            >
              {configList.map((config) => (
                <MenuItem key={config.configKey} value={config.configKey}>
                  {config.configKey.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Amount (₹)"
            value={amount}
            disabled
            sx={{
              flex: 0.5,
              minWidth: "120px",
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#1e3a8a",
                fontWeight: "bold",
              },
            }}
          />

          <TextField
            label="Result / Findings"
            placeholder="e.g. Normal"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            sx={{ flex: 1, minWidth: "200px" }}
          />

          <TextField
            type="datetime-local"
            label="Test Date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              flex: 1,
              minWidth: "200px",
            }}
          />

          <Button
            variant="contained"
            onClick={handleSubmit}
            startIcon={<AddCircleIcon />}
            sx={{
              height: 55,
              px: 4,

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

              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            Save Record
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* SEARCH BAR */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by Patient Name or PRN..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      {/* TABLE DATA GRID */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", border: "1px solid #e0e6ed" }}
      >
        <Table size="small">
          <TableHead
            sx={{ background: "linear-gradient(90deg,#1E40AF,#3B82F6)" }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                SI No
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold", py: 1.5 }}>
                PRN
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PATIENT NAME
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                VISIT NO
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                TEST
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                TARIFF
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                RESULT
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                DATE
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
              >
                ACTION
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report, index) => (
                <TableRow key={report.id} hover>
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                    PRN{String(report.patientId).padStart(4, "0")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {report.patientName || "Unknown"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#0284c7" }}>
                    {report.visitNumber}
                  </TableCell>
                  <TableCell>{report.testName}</TableCell>
                  <TableCell>₹{report.amount}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        backgroundColor:
                          report.result === "NORMAL" ? "#e8f5e9" : "#fff3e0",
                        color:
                          report.result === "NORMAL" ? "#2e7d32" : "#b78103",
                        px: 1,
                        py: 0.25,
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "0.7rem",
                      }}
                    >
                      {report.result || "PENDING"}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDateTime(report.testDate)}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(report.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>
    </Box>
  );
}
