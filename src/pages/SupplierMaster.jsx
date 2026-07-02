import React, { useEffect, useState } from "react";
import api from "../services/api";

import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TablePagination from "@mui/material/TablePagination";

const API = "/api/suppliers";

export default function SupplierMaster() {
  const [suppliers, setSuppliers] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    supplierCode: "",
    supplierName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    gstNumber: "",
    drugLicenseNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    const res = await api.get(API);
    setSuppliers(res.data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (editingId) {
      await api.put(`${API}/${editingId}`, formData);
    } else {
      await api.post(API, formData);
    }

    resetForm();

    loadSuppliers();
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      supplierCode: "",
      supplierName: "",
      contactPerson: "",
      mobile: "",
      email: "",
      gstNumber: "",
      drugLicenseNo: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const editSupplier = (row) => {
    setEditingId(row.id);

    setFormData(row);
  };

  const deleteSupplier = async (id) => {
    await api.delete(`${API}/${id}`);

    loadSuppliers();
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 1, borderRadius: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Supplier Code"
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Drug License No"
              name="drugLicenseNo"
              value={formData.drugLicenseNo}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          startIcon={editingId ? <EditIcon /> : <AddCircleIcon />}
          onClick={handleSubmit}
          sx={{
            mt: 3,
            height: 52,
            minWidth: 220,

            borderRadius: "14px",

            textTransform: "none",

            fontWeight: 700,

            background: "linear-gradient(135deg,#1E40AF,#06B6D4)",
          }}
        >
          {editingId ? "Update Supplier" : "Add Supplier"}
        </Button>
      </Paper>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  background: "linear-gradient(90deg,#1E40AF,#2563EB)",
                }}
              >
                {["SI No", "Code", "Supplier", "Mobile", "GST", "Actions"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {suppliers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{page * rowsPerPage + index + 1}</TableCell>

                    <TableCell>{row.supplierCode}</TableCell>

                    <TableCell>{row.supplierName}</TableCell>

                    <TableCell>{row.mobile}</TableCell>

                    <TableCell>{row.gstNumber}</TableCell>

                    <TableCell>
                      <IconButton onClick={() => editSupplier(row)}>
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        color="error"
                        onClick={() => deleteSupplier(row.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={suppliers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      </Paper>
    </Box>
  );
}
