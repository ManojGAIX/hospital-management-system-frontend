import React, { useEffect, useState } from "react";

import {
  TextField,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  MenuItem,
  TablePagination,
  Divider,
} from "@mui/material";

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../api/patientApi";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    dateOfBirth: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const genderOptions = ["Male", "Female", "Other"];

  const stateOptions = [
    "Karnataka",
    "Maharashtra",
    "Tamil Nadu",
    "Kerala",
    "Andhra Pradesh",
    "Telangana",
    "Delhi",
    "Gujarat",
    "West Bengal",
  ];

  const cityOptions = [
    "Vijayapura",
    "Bangalore",
    "Solapur",
    "Mumbai",
    "Pune",
    "Chennai",
    "Hyderabad",
    "Mysore",
    "Delhi",
    "Kolkata",
    "Ahmedabad",
  ];

  const [search, setSearch] = useState("");

  const filteredPatients = patients.filter((p) => {
    const patientName = p.name?.toLowerCase() || "";

    const patientCode = p.patientCode?.toLowerCase() || "";

    const phone = p.phone?.toString() || "";

    const prn = `prn${String(p.id).padStart(4, "0")}`;

    const searchText = search.toLowerCase();

    return (
      patientName.includes(searchText) ||
      patientCode.includes(searchText) ||
      phone.includes(searchText) ||
      prn.includes(searchText) ||
      String(p.id).includes(searchText) ||
      String(p.id).padStart(4, "0").includes(searchText)
    );
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const res = await getPatients();

      setPatients(res.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      console.error(err);
    }
  };

  // const formatPatientId = (id) => {
  //   return `PRN${String(id).padStart(4, "0")}`;
  // };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.age ||
      !formData.gender ||
      !formData.phone
    ) {
      showNotification("Please fill all required fields", "warning");

      return;
    }

    const payload = {
      ...formData,
      age: Number(formData.age),
    };

    try {
      if (editingId) {
        await updatePatient(editingId, payload);

        showNotification("Patient updated successfully", "success");
      } else {
        await createPatient(payload);

        showNotification("Patient registered successfully", "success");
      }

      resetForm();

      loadPatients();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);

    setFormData({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      dateOfBirth: patient.dateOfBirth || "",
      email: patient.email || "",
      address: patient.address || "",
      city: patient.city || "",
      state: patient.state || "",
      pincode: patient.pincode || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      age: "",
      gender: "",
      phone: "",
      dateOfBirth: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  return (
    <Box
      sx={{
        padding: "6px",
        backgroundColor: "#f0f7ff",
        minHeight: "100vh",
      }}
    >
      {/* FORM SECTION */}

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
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "250px",
            }}
          />

          <TextField
            label="Age"
            type="number"
            value={formData.age}
            onChange={(e) =>
              setFormData({
                ...formData,
                age: e.target.value,
              })
            }
            sx={{
              flex: 0.5,
              minWidth: "100px",
            }}
          />

          <TextField
            select
            label="Gender"
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "150px",
            }}
          >
            {genderOptions.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Phone"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // numbers only

              if (value.length <= 10) {
                setFormData({
                  ...formData,
                  phone: value,
                });
              }
            }}
            inputProps={{
              maxLength: 10,
            }}
            sx={{
              flex: 1,
              minWidth: "200px",
            }}
          />

          <TextField
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({
                ...formData,
                dateOfBirth: e.target.value,
              })
            }
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

          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "250px",
            }}
          />

          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value,
              })
            }
            sx={{
              flex: 2,
              minWidth: "300px",
            }}
          />

          <TextField
            select
            label="City"
            value={formData.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                city: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "180px",
            }}
          >
            {cityOptions.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="State"
            value={formData.state}
            onChange={(e) =>
              setFormData({
                ...formData,
                state: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "180px",
            }}
          >
            {stateOptions.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Pincode"
            value={formData.pincode}
            onChange={(e) =>
              setFormData({
                ...formData,
                pincode: e.target.value,
              })
            }
            sx={{
              flex: 1,
              minWidth: "180px",
            }}
          />

          <Box
            sx={{
              display: "flex",
              gap: "10px",
              ml: "auto",
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={editingId ? <EditIcon /> : <PersonAddIcon />}
              sx={{
                height: 52,
                minWidth: 180,
                px: 4,

                borderRadius: "14px",
                textTransform: "none",

                fontSize: "0.95rem",
                fontWeight: 700,
                letterSpacing: "0.3px",

                background: editingId
                  ? "linear-gradient(135deg, #06B6D4, #1E40AF)"
                  : "linear-gradient(135deg, #1E40AF, #06B6D4)",

                color: "#fff",

                boxShadow: "0 8px 24px rgba(30,64,175,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 28px rgba(30,64,175,0.35)",
                  background: editingId
                    ? "linear-gradient(135deg, #0891B2, #1D4ED8)"
                    : "linear-gradient(135deg, #1D4ED8, #0891B2)",
                },

                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              {editingId ? "Update Patient" : "Register Patient"}
            </Button>

            {editingId && (
              <Button
                variant="outlined"
                onClick={resetForm}
                sx={{
                  height: "55px",
                  color: "#1e3a8a",
                  borderColor: "#1e3a8a",
                }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* TABLE HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PersonSearchIcon
            sx={{
              color: "#1e3a8a",
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1e3a8a",
            }}
          >
            Patient Directory
          </Typography>
        </Box>

        {/* SEARCH + FILTER */}

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,

                backgroundColor: "#fff",

                "&:hover fieldset": {
                  borderColor: "#3B82F6",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#1E40AF",
                },
              },
            }}
            size="small"
            placeholder="Search by Patient Name or PRN Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
        </Box>
      </Box>
      {/* TABLE */}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: "12px", border: "1px solid #e0e6ed" }}
      >
        <Table size="small">
          <TableHead
            sx={{
              background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
            }}
          >
            <TableRow
              hover
              sx={{
                "&:nth-of-type(even)": {
                  backgroundColor: "#F8FAFC",
                },

                "&:hover": {
                  backgroundColor: "#EEF4FF",
                },
              }}
            >
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                SI No
              </TableCell>
              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                PATIENT ID
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                NAME
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                AGE
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                GENDER
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                PHONE
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                EMAIL
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                CITY
              </TableCell>

              <TableCell
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredPatients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((p, index) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{
                    "&:nth-of-type(even)": {
                      backgroundColor: "#f8faff",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: "500", textAlign: "center" }}>
                    {page * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#1e3a8a",
                    }}
                  >
                    {p.patientCode}
                  </TableCell>

                  <TableCell>{p.name}</TableCell>

                  <TableCell>{p.age}</TableCell>

                  <TableCell>{p.gender}</TableCell>

                  <TableCell>{p.phone}</TableCell>

                  <TableCell>{p.email}</TableCell>

                  <TableCell>{p.city}</TableCell>

                  <TableCell align="center">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 0.5,
                      }}
                    >
                      {/* EDIT */}

                      <Tooltip title="Edit Patient">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(p)}
                          sx={{
                            width: 32,
                            height: 32,

                            color: "#0284C7",
                            backgroundColor: "#E0F2FE",

                            border: "1px solid #BAE6FD",

                            "&:hover": {
                              backgroundColor: "#BAE6FD",
                              transform: "scale(1.05)",
                            },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>

                      {/* DELETE */}

                      <Tooltip title="Delete Patient">
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (window.confirm("Delete this record?")) {
                              deletePatient(p.id).then(loadPatients);
                            }
                          }}
                          sx={{
                            width: 32,
                            height: 32,

                            color: "#DC2626",
                            backgroundColor: "#FEF2F2",

                            border: "1px solid #FECACA",

                            "&:hover": {
                              backgroundColor: "#FEE2E2",
                              transform: "scale(1.05)",
                            },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredPatients.length}
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
