import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Autocomplete,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";

// Dummy placeholder helper functions to prevent compilation breakage
// Replace these with your actual import locations if they exist
const getPatients = () => axios.get("http://localhost:8080/api/patients");
const getScanReports = () => axios.get("http://localhost:8080/api/scanreports");
const deleteScanReport = (id) =>
  axios.delete(`http://localhost:8080/api/scanreports/${id}`);
const formatDateTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-IN") : "-";

export default function ScanReportScreen() {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [scanTypes, setScanTypes] = useState([]);

  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [scanType, setScanType] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [scanDate, setScanDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadPatients();
    loadReports();
    loadScanConfigs();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    try {
      const res = await getScanReports();
      setReports(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadScanConfigs = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/configs");
      const filtered = res.data.filter(
        (c) => c.configKey.includes("SCAN") || c.configKey.includes("XRAY"),
      );
      setScanTypes(filtered);
    } catch (err) {
      setScanTypes([
        { configKey: "XRAY" },
        { configKey: "MRI" },
        { configKey: "CT_SCAN" },
      ]);
    }
  };

  const handlePatientChange = (value) => {
    setPatientId(value);
    const patient = patients.find((p) => String(p.id) === String(value));
    setPatientName(patient ? patient.name : "");
  };

  const handleSubmit = async () => {
    if (!patientId || !scanType || !selectedFile) {
      alert("Please select patient, scan type and file");
      return;
    }

    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("patientName", patientName);
    formData.append("reportType", scanType);
    formData.append("status", status);
    formData.append("uploadDate", scanDate);
    formData.append("file", selectedFile);

    setIsUploading(true);
    try {
      await axios.post("http://localhost:8080/api/scanreports", formData, {
        onUploadProgress: (p) =>
          setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      alert("Upload Successful!");
      resetForm();
      loadReports();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setPatientId("");
    setScanType("");
    setSelectedFile(null);
    setStatus("PENDING");
    setScanDate(new Date().toISOString().split("T")[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete record?")) {
      try {
        await deleteScanReport(id);
        loadReports();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // =========================================================================
  // FIXED: TARGETS THE NEW SPRING CONTROLLER METHOD & HANDLES BLOB BUFFERING
  // =========================================================================
  const handleDownload = async (fileReference) => {
    if (!fileReference)
      return alert("No filename reference found for this report row record");

    const sanitizedFileName = fileReference
      .replace(/\\/g, "/")
      .split("/")
      .pop();

    try {
      const response = await axios.get(
        `http://localhost:8080/api/scanreports/download/${sanitizedFileName}`,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || response.data.type,
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", sanitizedFileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(
        "File stream download failed. Check if file physically exists inside D:/hospital-uploads/",
      );
    }
  };

  // =========================================================================
  // FIXED: HIDDEN IFRAME DISPOSITION CONFIG FOR DIRECT ACTION PRINTING
  // =========================================================================
  const handlePrint = async (fileReference) => {
    if (!fileReference)
      return alert("No filename reference found for this report row record");

    const sanitizedFileName = fileReference
      .replace(/\\/g, "/")
      .split("/")
      .pop();

    try {
      const response = await axios.get(
        `http://localhost:8080/api/scanreports/download/${sanitizedFileName}`,
        { responseType: "blob" },
      );

      const contentType =
        response.headers["content-type"] ||
        response.data.type ||
        "application/pdf";
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.left = "-9999px";
      iframe.src = url;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printErr) {
          window.open(url, "_blank").print();
        }
        setTimeout(() => {
          document.body.removeChild(iframe);
          window.URL.revokeObjectURL(url);
        }, 2000);
      };
    } catch (error) {
      console.error(error);
      alert("Print buffer assembly crashed.");
    }
  };

  const handleViewInline = (fileReference) => {
    if (!fileReference) return alert("No file found");
    const sanitized = fileReference.replace(/\\/g, "/").split("/").pop();
    window.open(
      `http://localhost:8080/api/scanreports/download/${sanitized}`,
      "_blank",
    );
  };

  const getStatusStyle = (val) => {
    switch (val) {
      case "NORMAL":
        return { color: "#2e7d32", bg: "#e8f5e9" };
      case "ABNORMAL":
        return { color: "#d32f2f", bg: "#ffebee" };
      default:
        return { color: "#ed6c02", bg: "#fff3e0" };
    }
  };

  const filteredScanReports = reports.filter((t) => {
    const pName = t.patientName?.toLowerCase() || "";
    const prn = `prn${String(t.patientId).padStart(4, "0")}`;
    const searchText = search.toLowerCase();
    return (
      pName.includes(searchText) ||
      prn.includes(searchText) ||
      String(t.patientId).includes(searchText)
    );
  });

  return (
    <Box
      sx={{ padding: "20px", backgroundColor: "#f0f7ff", minHeight: "100vh" }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: "30px",
          mb: 4,
          borderRadius: "16px",
          border: "1px solid #e0e6ed",
        }}
      >
        {/* Input Controls Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <FormControl fullWidth sx={{ flex: 2 }}>
            <Autocomplete
              options={patients}
              getOptionLabel={(option) =>
                `${option.patientCode} - ${option.name}`
              }
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <strong>{option.patientCode}</strong>
                    {" - "}
                    {option.name}
                    <br />
                    <small>{option.phone}</small>
                  </Box>
                </li>
              )}
              value={
                patients.find((p) => String(p.id) === String(patientId)) || null
              }
              onChange={(event, newValue) => {
                if (newValue) {
                  handlePatientChange(newValue.id);
                } else {
                  setPatientId("");
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Patient"
                  placeholder="Search by PRN, Name, Mobile"
                />
              )}
            />
          </FormControl>

          <FormControl sx={{ flex: 1.5 }}>
            <InputLabel>Scan Type</InputLabel>
            <Select
              value={scanType}
              label="Scan Type"
              onChange={(e) => setScanType(e.target.value)}
            >
              {scanTypes.map((config) => (
                <MenuItem key={config.configKey} value={config.configKey}>
                  {config.configKey.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="NORMAL">NORMAL</MenuItem>
              <MenuItem value="ABNORMAL">ABNORMAL</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Action Row */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Box sx={{ flex: 2 }}>
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept="application/pdf,image/*"
            />
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current.click()}
              sx={{
                height: "56px",
                borderStyle: "dashed",
                justifyContent: "flex-start",
                color: selectedFile ? "#008374" : "text.secondary",
                px: 2,
                textTransform: "none",
              }}
            >
              <Typography variant="body1" noWrap>
                {selectedFile
                  ? selectedFile.name
                  : "Select Scan File (PDF or Image)"}
              </Typography>
            </Button>
          </Box>
          <TextField
            type="date"
            label="Report Date"
            InputLabelProps={{ shrink: true }}
            value={scanDate}
            onChange={(e) => setScanDate(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isUploading}
            startIcon={<CloudUploadIcon />}
            sx={{
              flex: 1,
              height: 56,

              borderRadius: "14px",
              textTransform: "none",

              fontSize: "0.95rem",
              fontWeight: 700,

              background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

              boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

              transition: "all 0.3s ease",

              "&:hover": {
                background: "linear-gradient(135deg, #1D4ED8, #0891B2)",

                transform: "translateY(-2px)",

                boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
              },

              "&:disabled": {
                background: "#CBD5E1",
                color: "#64748B",
                boxShadow: "none",
                transform: "none",
              },
            }}
          >
            {isUploading ? `Uploading (${uploadProgress}%)` : "Upload Report"}
          </Button>
        </Box>
      </Paper>

      {/* Search Input Bar */}
      <Box sx={{ mb: 1 }}>
        <TextField
          fullWidth
          placeholder="Search by Patient Name or PRN..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* --- INTEGRATED DATA DATA TABLE RENDER VIEW --- */}
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
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PRN
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                PATIENT NAME
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                SCAN TYPE
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                UPLOAD DATE
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                STATUS
              </TableCell>
              <TableCell
                sx={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredScanReports
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((report, index) => {
                const badge = getStatusStyle(report.status);
                return (
                  <TableRow key={report.id} hover>
                    <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>
                      {report.patientId
                        ? `PRN${String(report.patientId).padStart(4, "0")}`
                        : "-"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {report.patientName}
                    </TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>{formatDateTime(report.uploadDate)}</TableCell>
                    <TableCell>
                      <Box
                        component="span"
                        sx={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "0.75rem",
                        }}
                      >
                        {report.status || "PENDING"}
                      </Box>
                    </TableCell>
                    {/* FIXED ACTIONS: PASSING report.fileName DIRECTLY FROM SPRING ENTITY RESPONSE */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <IconButton
                        color="info"
                        onClick={() => handleViewInline(report.fileName)}
                        title="View Report"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        color="primary"
                        onClick={() => handleDownload(report.fileName)}
                        title="Download file"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => handlePrint(report.fileName)}
                        title="Print Document"
                      >
                        <PrintIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(report.id)}
                        title="Delete Record"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredScanReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
}
