import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const API = "http://localhost:8080/api/procedures";

export default function ProcedureMaster() {
  const [procedures, setProcedures] = useState([]);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    procedureName: "",
    department: "",
    charge: "",
    status: "ACTIVE",
    category: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      const res = await axios.get(API);
      setProcedures(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = () => {
    setEditingId(null);

    setFormData({
      procedureCode: "",
      procedureName: "",
      amount: "",
      category: "",
    });

    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      procedureName: row.procedureName,
      department: row.department,
      charge: row.charge,
      status: row.status,
      category: row.category,
    });

    setOpen(true);
  };

  const handleSave = async () => {
    try {
      console.log("editingId =", editingId);
      console.log("formData =", formData);

      if (editingId) {
        await axios.put(`${API}/${editingId}`, formData);

        showMessage("Procedure Updated");
      } else {
        await axios.post(API, formData);

        showMessage("Procedure Added");
      }

      setOpen(false);
      loadProcedures();
    } catch (err) {
      console.error(err);
      showMessage("Save Failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Procedure ?")) return;

    try {
      await axios.delete(`${API}/${id}`);

      showMessage("Procedure Deleted");

      loadProcedures();
    } catch (err) {
      console.error(err);
      showMessage("Delete Failed", "error");
    }
  };

  const showMessage = (msg, severity = "success") => {
    setSnackbar({
      open: true,
      msg,
      severity,
    });
  };

  const filtered = procedures.filter((p) =>
    `${p.procedureName} ${p.department}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <Box p={3}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search Procedure..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "right" }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpen}
                sx={{
                  height: 50,

                  borderRadius: "14px",
                  textTransform: "none",

                  fontSize: "0.95rem",
                  fontWeight: 700,
                  letterSpacing: "0.3px",

                  background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                  color: "#fff",

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
                Add Procedure
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead
              sx={{
                background: "linear-gradient(90deg,#1E40AF,#3B82F6)",
              }}
            >
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  SI No
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>Procedure Name</TableCell>

                <TableCell sx={{ color: "#fff" }}>Department</TableCell>

                <TableCell sx={{ color: "#fff" }}>Category</TableCell>

                <TableCell sx={{ color: "#fff" }}>Charge</TableCell>

                <TableCell sx={{ color: "#fff" }}>Status</TableCell>

                <TableCell
                  sx={{
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  Action
                </TableCell>
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
                    <TableCell>{row.procedureName}</TableCell>

                    <TableCell>{row.department}</TableCell>

                    <TableCell>{row.category}</TableCell>

                    <TableCell>₹{Number(row.charge).toFixed(2)}</TableCell>

                    <TableCell>{row.status}</TableCell>

                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(row)}
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => handleDelete(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Procedures Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      </Paper>

      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? "Edit Procedure" : "Add Procedure"}
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Procedure Name"
                value={formData.procedureName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    procedureName: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    department: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Charge"
                value={formData.charge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    charge: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                sx={{ flex: 1, minWidth: 225 }}
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value,
                  })
                }
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                sx={{ flex: 1, minWidth: 225 }}
                label="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                  })
                }
              >
                <MenuItem value="Minor OT">Minor OT</MenuItem>
                <MenuItem value="Dressing">Dressing</MenuItem>
                <MenuItem value="Suturing">Suturing</MenuItem>
                <MenuItem value="Injection">Injection</MenuItem>
                <MenuItem value="Nebulization">Nebulization</MenuItem>
                <MenuItem value="ECG">ECG</MenuItem>
                <MenuItem value="Endoscopy">Endoscopy</MenuItem>
                <MenuItem value="Dental">Dental</MenuItem>
                <MenuItem value="ENT">ENT</MenuItem>
                <MenuItem value="Orthopedic">Orthopedic</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
