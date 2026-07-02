import React, { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import ScienceIcon from "@mui/icons-material/Science";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import hospitalLogo from "/logo.png";

import PrintIcon from "@mui/icons-material/Print";

const API = "/api";

export default function LabResultEntry() {
  const [search, setSearch] = useState("");

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(false);

  const [patient, setPatient] = useState(null);

  const [tests, setTests] = useState([]);

  const [selectedTest, setSelectedTest] = useState(null);

  const [parameters, setParameters] = useState([]);

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/patients");

      setPatients(res.data);
    } catch (err) {
      console.error("Patients Load Error", err);
    }
  };

  // ==========================
  // SEARCH PATIENT
  // ==========================

  const handleSearchPatient = async () => {
    try {
      const patient = patients.find(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.phone?.includes(search) ||
          p.patientCode?.toLowerCase().includes(search.toLowerCase()),
      );

      if (!patient) {
        alert("Patient not found");
        return;
      }

      setSelectedPatient(patient);

      const testRes = await api.get(`${API}/labtests/patient/${patient.id}`);

      setTests(testRes.data);

      setSelectedTest(null);
      setParameters([]);
    } catch (err) {
      console.error(err);

      alert("Failed to load patient data");
    }
  };

  // ==========================
  // LOAD TEST PARAMETERS
  // ==========================

  const loadParameters = async (test) => {
    try {
      setSelectedTest(test);

      const res = await api.get(`${API}/labtests/${test.id}/parameters`, {
        params: {
          testName: test.testName,
        },
      });

      const rows = (res.data || []).map((p) => {
        let minValue = null;
        let maxValue = null;

        if (p.normalRange && p.normalRange.includes("-")) {
          const [min, max] = p.normalRange.split("-");

          minValue = Number(min.trim());
          maxValue = Number(max.trim());
        }

        return {
          ...p,
          resultValue: p.resultValue ?? "",
          minValue,
          maxValue,
        };
      });

      setParameters(rows);
    } catch (err) {
      console.error(err);
      alert("Failed to load parameters");
    }
  };

  // ==========================
  // CHANGE RESULT
  // ==========================

  const handleParameterChange = (index, value) => {
    setParameters((prev) =>
      prev.map((p, i) => {
        if (i !== index) return p;

        const numericValue = parseFloat(value);

        let status = "PENDING";

        if (
          value !== "" &&
          !isNaN(numericValue) &&
          p.minValue != null &&
          p.maxValue != null
        ) {
          if (numericValue < Number(p.minValue)) {
            status = "LOW";
          } else if (numericValue > Number(p.maxValue)) {
            status = "HIGH";
          } else {
            status = "NORMAL";
          }
        }

        return {
          ...p,
          resultValue: value,
          status,
        };
      }),
    );
  };

  // ==========================
  // SAVE RESULTS
  // ==========================

  const saveResults = async () => {
    try {
      await api.post(`${API}/labtests/results`, {
        labTestId: selectedTest.id,
        results: parameters,
      });

      alert("Results Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Save Failed");
    }
  };

  const generatePDF = () => {
    if (!selectedPatient || !selectedTest) return;

    const patient = selectedPatient;

    const doc = new jsPDF();

    // ==========================================
    // HOSPITAL LOGO
    // ==========================================

    const logoWidth = 140;
    const logoHeight = 32;

    const pageWidth = doc.internal.pageSize.getWidth();

    const x = (pageWidth - logoWidth) / 2;

    doc.addImage(hospitalLogo, "PNG", x, 8, logoWidth, logoHeight);

    // ==========================================
    // HOSPITAL ADDRESS
    // ==========================================

    doc.setFontSize(10);
    doc.setTextColor(80);

    doc.text(
      "Madhav Hosp. Premises, Near Kanni Towers, Railway Station Road, Indi - 586209",
      105,
      44,
      { align: "center" },
    );

    doc.setDrawColor(30, 58, 138);
    doc.line(10, 45, 200, 45);

    // ==========================================
    // REPORT TITLE
    // ==========================================

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.setFont(undefined, "bold");

    doc.text("LABORATORY REPORT", 105, 58, { align: "center" });

    // ==========================================
    // PATIENT DETAILS
    // ==========================================

    let y = 75;

    doc.setTextColor(0);
    doc.setFontSize(11);

    doc.setFont(undefined, "bold");
    doc.text("Patient Name", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(patient.name || "-", 55, y);

    doc.setFont(undefined, "bold");
    doc.text("PRN", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(patient.patientCode || "-", 155, y);

    // ==========================================

    y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Mobile", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(patient.phone || "-", 55, y);

    doc.setFont(undefined, "bold");
    doc.text("Test", 125, y);
    doc.text(":", 150, y);

    doc.setFont(undefined, "normal");
    doc.text(selectedTest.testName || "-", 155, y);

    // ==========================================

    y += 10;

    doc.setFont(undefined, "bold");
    doc.text("Date", 15, y);
    doc.text(":", 50, y);

    doc.setFont(undefined, "normal");
    doc.text(
      new Date(selectedTest.testDate).toLocaleDateString("en-GB"),
      55,
      y,
    );

    autoTable(doc, {
      startY: y + 10,

      head: [["Parameter", "Result", "Unit", "Normal Range", "Status"]],

      body: parameters.map((p) => {
        const value = Number(p.resultValue);

        let status = "Normal";

        if (!isNaN(value) && p.maxValue && value > p.maxValue) {
          status = "High";
        }

        if (!isNaN(value) && p.minValue && value < p.minValue) {
          status = "Low";
        }

        return [p.parameterName, p.resultValue, p.unit, p.normalRange, status];
      }),
    });

    const signY = doc.lastAutoTable.finalY + 35;

    doc.line(140, signY, 190, signY);

    doc.setFontSize(10);
    doc.setTextColor(0);

    doc.text("Pathologist Signature", 150, signY + 8);

    doc.save(`${patient.patientCode}_${selectedTest.testName}.pdf`);
  };

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      {/* ================================= */}
      {/* SEARCH */}
      {/* ================================= */}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "18px",

          background:
            "linear-gradient(135deg,#1E40AF 0%,#2563EB 50%,#06B6D4 100%)",

          color: "#fff",

          boxShadow: "0 10px 30px rgba(30,64,175,0.25)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Search PRN / Name / Mobile"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
            sx={{
              width: 320,

              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",

                borderRadius: "12px",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearchPatient}
            sx={{
              height: 48,

              borderRadius: "12px",

              textTransform: "none",

              fontWeight: 700,

              background: "#fff",

              color: "#1E40AF",

              "&:hover": {
                background: "#f1f5f9",
              },
            }}
          >
            Search Patient
          </Button>

          {selectedPatient && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",

                px: 2,
                py: 1,

                borderRadius: "12px",

                background: "rgba(255,255,255,0.12)",

                backdropFilter: "blur(10px)",
              }}
            >
              <Typography>
                <strong>Name:</strong> {selectedPatient.name}
              </Typography>

              <Typography>
                <strong>PRN:</strong> {selectedPatient.patientCode}
              </Typography>

              <Typography>
                <strong>Mobile:</strong> {selectedPatient.phone}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ================================= */}
      {/* TEST LIST */}
      {/* ================================= */}

      {tests.length > 0 && (
        <Paper
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700} mb={2}>
            Ordered Tests
          </Typography>

          <Grid container spacing={2}>
            {tests.map((test) => (
              <Grid item xs={12} md={4} key={test.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 3,
                    border:
                      selectedTest?.id === test.id
                        ? "2px solid #1E40AF"
                        : "1px solid #e5e7eb",
                  }}
                  onClick={() => loadParameters(test)}
                >
                  <Typography fontWeight={700}>{test.testName}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {test.testDate}
                  </Typography>

                  <Chip
                    size="small"
                    icon={<ScienceIcon />}
                    label="Open"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* ================================= */}
      {/* RESULT ENTRY */}
      {/* ================================= */}

      {selectedTest && (
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 2,
              background: "linear-gradient(90deg,#1E40AF,#2563EB)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#FFFFFF !important",
                fontWeight: 700,
              }}
            >
              {selectedTest?.testName}
            </Typography>
          </Box>

          <Divider />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Parameter</TableCell>

                  <TableCell>Result</TableCell>

                  <TableCell>Unit</TableCell>

                  <TableCell>Normal Range</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {parameters.map((param, index) => {
                  const value = parseFloat(param.resultValue);

                  const isNumeric = param.resultValue !== "" && !isNaN(value);

                  const isHigh =
                    isNumeric &&
                    param.maxValue !== null &&
                    value > Number(param.maxValue);

                  const isLow =
                    isNumeric &&
                    param.minValue !== null &&
                    value < Number(param.minValue);

                  const isNormal = isNumeric && !isHigh && !isLow;

                  return (
                    <TableRow
                      sx={{
                        backgroundColor:
                          param.status === "HIGH"
                            ? "#fee2e2"
                            : param.status === "LOW"
                              ? "#fef3c7"
                              : param.status === "NORMAL"
                                ? "#ecfdf5"
                                : "#ffffff",
                      }}
                    >
                      <TableCell>{param.parameterName}</TableCell>

                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={param.resultValue ?? ""}
                          onChange={(e) =>
                            handleParameterChange(index, e.target.value)
                          }
                          inputProps={{
                            inputMode: "decimal",
                          }}
                        />
                      </TableCell>

                      <TableCell>{param.unit}</TableCell>

                      <TableCell>{param.normalRange}</TableCell>

                      <TableCell>
                        {isHigh ? (
                          <Chip label="HIGH" color="error" size="small" />
                        ) : isLow ? (
                          <Chip label="LOW" color="warning" size="small" />
                        ) : isNormal ? (
                          <Chip label="NORMAL" color="success" size="small" />
                        ) : (
                          <Chip label="PENDING" size="small" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              p: 3,
              textAlign: "right",
            }}
          >
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveResults}
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg,#10B981,#059669)",
              }}
            >
              Save Results
            </Button>

            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={generatePDF}
              sx={{
                borderRadius: "12px",
                ml: 2,

                background: "linear-gradient(135deg,#1E40AF,#06B6D4)",

                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Print Report
            </Button>
          </Box>
        </Paper>
      )}

      {loading && (
        <Box textAlign="center" mt={3}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
