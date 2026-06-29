import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Stack,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

export default function PatientProfile() {
  const { patientId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProfile();
  }, [patientId]);

 const loadProfile = async () => {
  if (!patientId) return;

  try {
    const res = await axios.get(
      `http://localhost:8080/api/patientprofile/${patientId}`
    );

    setPatient(res.data.patient);
    setData(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const [tab, setTab] = useState(0);

  // const patient = data?.patient || {};

  const kpis = useMemo(
    () => ({
      visits: data?.visitCount || 0,
      invoices: data?.invoiceCount || 0,
      pharmacy: data?.pharmacyCount || 0,
      revenue: data?.totalRevenue || 0,
    }),
    [data],
  );

  const [patient, setPatient] = useState(null);
  const handleSearchPatient = async () => {
    try {
      const clean = search.replace(/\D/g, "");

      const res = await axios.get(
        `http://localhost:8080/api/patientprofile/${clean}`,
      );

      setPatient(res.data.patient);
      setData(res.data);
    } catch (err) {
      setPatient(null);
      alert("Patient not found");
    }
  };

  const handlePrint = () => window.print();

  // ================= FILTERS =================
  const visits = data?.visits || [];
  const invoices = data?.invoices || [];
  const pharmacy = data?.pharmacySales || [];
  const labTests = data?.labTests || [];
  const procedures = data?.procedures || [];
  const physio = data?.physioSessions || [];
  const prescriptions = data?.prescriptions || [];

  const filteredVisits = visits.filter(
    (v) =>
      (v.visitNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.doctorName || "").toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading Patient Profile...</Typography>
      </Box>
    );
  }

  // ================= UI =================
  return (
    <Box sx={{ p: 2 }}>
      {/* HEADER */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(90deg,#1E40AF 0%,#2563EB 50%,#06B6D4 100%)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(30,64,175,0.25)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          {patient && (
            <Box
              sx={{
                px: 3,
                py: 2,
                borderRadius: "14px",
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            >
              <Typography variant="h4" fontWeight={700}>
                {patient?.name}
              </Typography>

              <Typography>PRN : {patient?.patientCode}</Typography>

              <Typography>
                {patient?.phone} | {patient?.email}
              </Typography>

              <Typography>
                {patient?.city}, {patient?.state}
              </Typography>
            </Box>
          )}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <TextField
              size="small"
              placeholder="Search Patient ID / PRN"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchPatient()}
              sx={{
                width: 280,
                "& .MuiOutlinedInput-root": {
                  background: "#fff",
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
              disabled={loading}
              sx={{
                height: 52,
                minWidth: 190,
                px: 4,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                color: "#fff",

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

                "&.Mui-disabled": {
                  background: "#cbd5e1",
                  color: "#64748b",
                  boxShadow: "none",
                },
              }}
            >
              {loading ? "Searching..." : "Search Patient"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            title: "Visits",
            value: data?.visitCount || 0,
          },
          {
            title: "Invoices",
            value: data?.invoiceCount || 0,
          },
          {
            title: "Pharmacy",
            value: data?.pharmacyCount || 0,
          },
          {
            title: "Revenue",
            value: `₹${Number(data?.totalRevenue || 0).toLocaleString()}`,
          },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(135deg,#ffffff,#f8fafc)",
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  {item.title}
                </Typography>

                <Typography variant="h4" fontWeight={700} color="#1E40AF">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* TABS */}
      <Card>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="scrollable">
          <Tab label="Overview" />
          <Tab label="Visits" />
          <Tab label="Prescriptions" />
          <Tab label="Lab Reports" />
          <Tab label="Pharmacy" />
          <Tab label="Procedures" />
          <Tab label="Billing" />
          <Tab label="Physio" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* ================= OVERVIEW ================= */}
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Patient Details</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography>Name: <strong>{patient?.name}</strong></Typography>
                    <Typography>Age: {patient?.age}</Typography>
                    <Typography>Gender: {patient?.gender}</Typography>
                    <Typography>Phone: {patient?.phone}</Typography>
                    <Typography>Email: {patient?.email}</Typography>
                    <Typography>Address: {patient?.address}</Typography>
                    <Typography>City: {patient?.city}</Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Revenue</Typography>
                    <Typography variant="h4" color="primary">
                      ₹ {kpis.revenue}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* ================= VISITS ================= */}
          {tab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Visit No</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVisits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.visitNumber}</TableCell>
                      <TableCell>{v.visitDate}</TableCell>
                      <TableCell>{v.doctorName}</TableCell>
                      <TableCell>
                        <Chip label={v.status} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ================= PRESCRIPTIONS ================= */}
          {tab === 2 && (
            <Grid container spacing={2}>
              {prescriptions.length === 0 && (
                <Typography>No prescriptions found</Typography>
              )}

              {prescriptions.map((p) => (
                <Grid item xs={12} md={6} key={p.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{p.medicineName}</Typography>
                      <Typography>Frequency: {p.dosage}</Typography>
                      <Typography>Days: {p.days}</Typography>
                      <Typography>Instructions: {p.instructions}</Typography>
                      <Typography>PDate: {p.prescriptionDate}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* ================= LAB REPORTS ================= */}
          {tab === 3 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Test</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Test Date</TableCell>
                    <TableCell>Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {labTests.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.testName}</TableCell>
                      <TableCell>
                        <Chip label={l.status} color="warning" />
                      </TableCell>
                      <TableCell>{l.testDate}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<DownloadIcon />}
                          href={l.reportUrl}
                          target="_blank"
                          disabled={!l.reportUrl}
                        >
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ================= PHARMACY ================= */}
          {tab === 4 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Subtotal</TableCell>
                    <TableCell>GST</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pharmacy.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.invoiceNumber}</TableCell>
                      <TableCell>{p.saleDate?.split("T")[0]}</TableCell>
                      <TableCell>₹{p.subtotal}</TableCell>
                      <TableCell>₹{p.gstAmount}</TableCell>
                      <TableCell>₹{p.finalAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ================= PROCEDURES ================= */}
          {/* ================= PROCEDURES ================= */}
          {tab === 5 && (
            <Box>
              {data?.procedureBills?.length > 0 ? (
                data.procedureBills.map((bill, index) => (
                  <Card
                    key={bill.id || index}
                    sx={{
                      mb: 3,
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(30,64,175,0.12)",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    {/* HEADER */}
                    <Box
                      sx={{
                        px: 3,
                        py: 2,
                        background:
                          "linear-gradient(135deg,#1E40AF 0%, #06B6D4 100%)",
                        color: "#fff",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Procedure Bill #{bill.id}
                      </Typography>

                      <Typography variant="body2">
                        Patient : {bill.patientName}
                      </Typography>

                      <Typography variant="body2">
                        Visit ID : {bill.visitId || "-"}
                      </Typography>
                    </Box>

                    <CardContent>
                      {/* ITEMS TABLE */}

                      <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                          border: "1px solid #E2E8F0",
                          borderRadius: 2,
                        }}
                      >
                        <Table size="small">
                          <TableHead
                            sx={{
                              background:
                                "linear-gradient(90deg,#1E40AF,#2563EB)",
                              "& .MuiTableCell-root": {
                                color: "#fff",
                                fontWeight: 700,
                              },
                            }}
                          >
                            <TableRow>
                              <TableCell>Procedure Name</TableCell>
                              <TableCell align="center">Qty</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Amount</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {bill.items?.length > 0 ? (
                              bill.items.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{item.procedureName}</TableCell>

                                  <TableCell align="center">
                                    {item.quantity || 1}
                                  </TableCell>

                                  <TableCell align="right">
                                    ₹{Number(item.amount || 0).toFixed(2)}
                                  </TableCell>

                                  <TableCell align="right">
                                    ₹{Number(item.amount || 0).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} align="center">
                                  No procedure items found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* TOTALS */}

                      <Box
                        sx={{
                          mt: 3,
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            minWidth: 280,
                            borderRadius: 3,
                            bgcolor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <Typography>
                            Subtotal : ₹{Number(bill.subtotal || 0).toFixed(2)}
                          </Typography>

                          <Typography color="error">
                            Discount : ₹{Number(bill.discount || 0).toFixed(2)}
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "#1E40AF",
                            }}
                          >
                            Total : ₹{Number(bill.finalAmount || 0).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                  }}
                >
                  <Typography color="text.secondary">
                    No procedure bills found
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* ================= BILLING ================= */}
          {tab === 6 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Visit</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell>{i.invoiceNumber}</TableCell>
                      <TableCell>{i.visitNumber}</TableCell>
                      <TableCell>{i.invoiceDate?.split("T")[0]}</TableCell>
                      <TableCell>₹{i.totalAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ================= PHYSIO ================= */}
          {tab === 7 && (
            <Stack spacing={2}>
              {physio?.length === 0 && (
                <Typography>No physio sessions</Typography>
              )}

              {physio.map((s) => (
                <Card key={s.id}>
                  <CardContent>
                    <Typography variant="h6">
                      Session #{s.sessionNumber}
                    </Typography>
                    <Typography>Date: {s.date}</Typography>
                    <Typography>Therapist: {s.therapistName}</Typography>
                    <Typography>Notes: {s.notes}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
