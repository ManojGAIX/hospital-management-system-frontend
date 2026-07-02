import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  Chip,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Divider,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import GroupsIcon from "@mui/icons-material/Groups";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";

import api from "../services/api";

// const res = api.create({
//   baseURL: "/api",
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//   },
// });

export default function UserMaster() {
  const [users, setUsers] = useState([]);
  const [allPrivileges, setAllPrivileges] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "STAFF",
    selectedPrivileges: [],
  });

  useEffect(() => {
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      const usersRes = await api.get("api/users");

      setUsers(usersRes.data);
    } catch (e) {
      console.error("Users Error", e);
    }

    try {
      const privsRes = await api.get("api/privileges");

      console.log(privsRes.data);

      setAllPrivileges(privsRes.data);
    } catch (e) {
      console.error("Privileges Error", e);
    }
  };
  const handleOpen = () => {
    setFormData({
      username: "",
      password: "",
      role: "STAFF",
      selectedPrivileges: [],
    });

    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePrivilegeChange = (id) => {
    const current = [...formData.selectedPrivileges];

    const index = current.indexOf(id);

    if (index === -1) {
      current.push(id);
    } else {
      current.splice(index, 1);
    }

    setFormData({
      ...formData,
      selectedPrivileges: current,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      username: formData.username,
      password: formData.password,
      role: formData.role,
      privileges: formData.selectedPrivileges.map((id) => ({
        id,
      })),
    };

    try {
      if (editingId) {  
        await api.put(`api/users/${editingId}`, payload);
      } else {
        await api.post("api/users", payload);
      }

      handleClose();
      fetchData();
    } catch (err) {
      setError("Failed to save user");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const doctorCount = users.filter((u) => u.role === "DOCTOR").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;

  console.log("allPrivileges State =", allPrivileges);

  const handleSelectAll = () => {
    setFormData({
      ...formData,
      selectedPrivileges: allPrivileges.map((p) => p.id),
    });
  };

  const handleDeselectAll = () => {
    setFormData({
      ...formData,
      selectedPrivileges: [],
    });
  };

  const [editingId, setEditingId] = useState(null);

  const handleEdit = (user) => {
    setEditingId(user.id);

    setFormData({
      username: user.username,
      password: "",
      role: user.role,
      selectedPrivileges: user.privileges?.map((p) => p.id) || [],
    });

    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await api.delete(`api/users/${id}`);

      fetchData();
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  return (
    <Box>
      {/* SUMMARY CARDS */}

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <Card
          sx={{
            minWidth: 180,
            height: 140,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #6a1b9a, #ab47bc)",
            boxShadow: 4,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 8,
            },
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Total Users
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {totalUsers}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 180,
            height: 140,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #4da169, #78c297)",
            boxShadow: 4,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 8,
            },
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Admins
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {adminCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 180,
            height: 140,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #74b9de, #39abca)",
            boxShadow: 4,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 8,
            },
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Doctors
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {doctorCount}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            minWidth: 180,
            height: 140,
            borderRadius: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #ae5987, #d6939a)",
            boxShadow: 4,
            transition: "0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: 8,
            },
          }}
        >
          <CardContent
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Staff
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mt: 1,
              }}
            >
              {staffCount}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* MAIN PANEL */}

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
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
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
            Create User
          </Button>
        </Box>

        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search Username..."
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
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead
              sx={{ background: "linear-gradient(90deg,#1E40AF,#3B82F6)" }}
            >
              <TableRow
                sx={{ background: "linear-gradient(90deg,#1E40AF,#3B82F6)" }}
              >
                <TableCell>
                  <b>Username</b>
                </TableCell>

                <TableCell>
                  <b>Role</b>
                </TableCell>

                <TableCell>
                  <b>Privileges</b>
                </TableCell>
                <TableCell align="center">
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon color="primary" />
                      {user.username}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.role}
                      color={
                        user.role === "ADMIN"
                          ? "error"
                          : user.role === "DOCTOR"
                            ? "primary"
                            : "success"
                      }
                    />
                  </TableCell>

                  <TableCell sx={{ maxWidth: 350 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      {user.privileges?.length > 0 ? (
                        user.privileges.map((p) => (
                          <Chip
                            key={p.id}
                            label={p.pageLink.replace("/", "")}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: "11px",
                              height: 24,
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="caption">No Privileges</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit User">
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete User">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* CREATE USER */}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingId ? "Edit User" : "Create New User"}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Username"
                name="username"
                fullWidth
                value={formData.username}
                onChange={handleInputChange}
              />

              <TextField
                label="Password"
                name="password"
                type="password"
                fullWidth
                value={formData.password}
                onChange={handleInputChange}
              />

              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <MenuItem value="ADMIN">ADMIN</MenuItem>

                <MenuItem value="DOCTOR">DOCTOR</MenuItem>

                <MenuItem value="STAFF">STAFF</MenuItem>
              </TextField>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Assign Privileges
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={handleDeselectAll}
                    >
                      Clear All
                    </Button>
                  </Stack>
                </Box>

                <Grid container spacing={1}>
                  {allPrivileges.map((priv) => (
                    <Grid item xs={12} sm={6} md={3} key={priv.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={formData.selectedPrivileges.includes(
                              priv.id,
                            )}
                            onChange={() => handlePrivilegeChange(priv.id)}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.85rem",
                            }}
                          >
                            {priv.pageLink.replace("/", "")}
                          </Typography>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              gap: 1.5,
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleClose}
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
              type="submit"
              variant="contained"
              startIcon={editingId ? <EditIcon /> : <SaveIcon />}
              sx={{
                minWidth: 150,
                height: 44,

                borderRadius: "12px",
                textTransform: "none",

                fontSize: "0.9rem",
                fontWeight: 700,

                background: editingId
                  ? "linear-gradient(135deg, #06B6D4, #0891B2)"
                  : "linear-gradient(135deg, #10B981, #059669)",

                boxShadow: editingId
                  ? "0 8px 20px rgba(6,182,212,0.25)"
                  : "0 8px 20px rgba(16,185,129,0.25)",

                transition: "all 0.3s ease",

                "&:hover": {
                  background: "linear-gradient(135deg, #1E40AF, #06B6D4)",

                  transform: "translateY(-2px)",

                  boxShadow: "0 12px 28px rgba(30,64,175,0.30)",
                },
              }}
            >
              {editingId ? "Update User" : "Save User"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
