import React, { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  Avatar,
  Divider,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import api from "../services/api";

export default function UserMaster() {
  const [users, setUsers] = useState([]);

  const [privileges, setPrivileges] = useState([]);

  const [groupedPrivileges, setGroupedPrivileges] = useState({});

  const [selectedPrivileges, setSelectedPrivileges] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);

  const [loadingPrivileges, setLoadingPrivileges] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [userSearch, setUserSearch] = useState("");

  const [privilegeSearch, setPrivilegeSearch] = useState("");

  const [editingUserId, setEditingUserId] = useState(null);

  const [expandedModule, setExpandedModule] = useState("DASHBOARD");

  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    role: "RECEPTION",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadUsers();
    loadPrivileges();
  }, []);

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

  const loadPrivileges = async () => {
    try {
      setLoadingPrivileges(true);

      const res = await api.get("api/privileges");
      console.log("setPrivileges", res.data);
console.log(res.data);
      setPrivileges(res.data);

      groupPrivileges(res.data);
    } finally {
      setLoadingPrivileges(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await api.get("api/users");

      setUsers(res.data);
    } finally {
      setLoadingUsers(false);
    }
  };
  const groupPrivileges = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const module = item.module || "OTHER";

      if (!grouped[module]) {
        grouped[module] = [];
      }

      grouped[module].push(item);
    });

    setGroupedPrivileges(grouped);
  };

  const getPrivilegeLabel = (priv) => {
  return (
    priv.description ||
    priv.pageName ||
    priv.pageLink ||
    priv.privilegeName ||
    priv.module ||
    "Unknown"
  );
};

  const filteredUsers = users.filter((user) =>
    (user.username || "").toLowerCase().includes(userSearch.toLowerCase()),
  );

  const roleTemplates = {
    ADMIN: privileges.map((item) => item.id),

    DOCTOR: privileges
      .filter((item) =>
        ["DOCTOR", "PRESCRIPTION", "PATIENT", "APPOINTMENT"].includes(
          item.module,
        ),
      )
      .map((item) => item.id),

    RECEPTION: privileges
      .filter((item) =>
        ["PATIENT", "APPOINTMENT", "BILLING"].includes(item.module),
      )
      .map((item) => item.id),

    STAFF: [],
  };

  const handlePrivilegeToggle = (id) => {
    setSelectedPrivileges((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };


  const handleModuleToggle = (module) => {
    const modulePrivileges = groupedPrivileges[module].map(
      (item) => item.id,
    );

    const allSelected = modulePrivileges.every((id) =>
      selectedPrivileges.includes(id),
    );

    if (allSelected) {
      setSelectedPrivileges(
        selectedPrivileges.filter((id) => !modulePrivileges.includes(id)),
      );
    } else {
      setSelectedPrivileges([
        ...new Set([...selectedPrivileges, ...modulePrivileges]),
      ]);
    }
  };

  const isModuleSelected = (module) => {
    const modulePrivileges =
      groupedPrivileges[module]?.map((item) => item.id) || [];

    return (
      modulePrivileges.length > 0 &&
      modulePrivileges.every((id) => selectedPrivileges.includes(id))
    );
  };

  const getModuleCount = (module) => {
    const modulePrivileges =
      groupedPrivileges[module]?.map((item) => item.id) || [];

    const selected = modulePrivileges.filter((id) =>
      selectedPrivileges.includes(id),
    );

    return `${selected.length}/${modulePrivileges.length}`;
  };

  const filterPrivileges = (module) => {
    return groupedPrivileges[module].filter((priv) => {
      const name = getPrivilegeLabel(priv);

      return name.toLowerCase().includes(privilegeSearch.toLowerCase());
    });
  };

  const handleUserChange = (e) => {
    setUserForm({
      ...userForm,

      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;

    setUserForm({
      ...userForm,

      role: role,
    });

    if (roleTemplates[role]) {
      setSelectedPrivileges(roleTemplates[role]);
    } else {
      setSelectedPrivileges(roleTemplates.RECEPTION);
    }
  };

  const openCreateUser = () => {
    setUserForm({
      username: "",
      password: "",
      role: "RECEPTION",
      status: "ACTIVE",
    });

    setSelectedPrivileges([]);

    setOpenUserDialog(true);
  };

  const toggleStatus = async (user) => {
    const payload = {
      username: user.username,

      role: user.role,

      status: user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    };

    try {
      await api.put(
        `api/users/${user.id}`,

        payload,
      );

      loadUsers();
    } catch (error) {
      console.error("Status Update Error", error);
    }
  };


  const saveUser = async () => {
    const payload = {
      username: userForm.username,

      password: userForm.password,

      role: userForm.role,

      status: userForm.status,

      privileges: selectedPrivileges.map((id) => ({
        id: id,
      })),
    };

    console.log("payload" , payload)
    try {
      if (editingUserId) {
        await api.put(
          `api/users/${editingUserId}`,

          payload,
        );
        showNotification("User Updated Successfully", "success");
      } else {
        await api.post(
          "api/users",

          payload,
        );
        showNotification("User Saved Successfully", "success");
      }

      loadUsers();

      setEditingUserId(null);

    } catch (error) {
      console.error("Save User Error", error);
      showNotification("Failed to save user", "error");
    }
  };

  const editUser = (user) => {
    setSelectedUser(user);

    setEditingUserId(user.id);

    setUserForm({
      username: user.username || "",
      password: "",
      role: user.role || "RECEPTION",
      status: user.status || "ACTIVE",
    });

    setSelectedPrivileges(user.privileges?.map((p) => p.id) || []);
  };

  const createNewUser = () => {
    setSelectedUser(null);

    setEditingUserId(null);

    setSelectedPrivileges([]);

    setUserForm({
      username: "",
      password: "",
      role: "RECEPTION",
      status: "ACTIVE",
    });
  };

  const openDeleteDialog = (id) => {
    setDeleteUserId(id);

    setDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setDeleteUserId(null);

    setDeleteDialog(false);
  };

  const deleteUser = async () => {
    try {
      await api.delete(`api/users/${deleteUserId}`);

      loadUsers();

      closeDeleteDialog();
    } catch (error) {
      console.error("Delete User Error", error);
    }
  };

  return (
    <Box sx={{ p: 3, background: "#F4F7FB", minHeight: "100vh" }}>
      {/* HEADER */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography Typography variant="h4" fontWeight={800} color="#1E3A8A">
            User Master
          </Typography>

          <Typography color="text.secondary">
            Manage Users, Roles & Privilege Management
          </Typography>
        </Box>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg,#2563EB,#3B82F6)",
            color: "#fff",
          }}
        >
          <Typography variant="body2">Total Users</Typography>
          <Typography variant="h4" fontWeight={700}>
            {users.length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg,#16A34A,#22C55E)",
            color: "#fff",
          }}
        >
          <Typography variant="body2">Active Users</Typography>
          <Typography variant="h4" fontWeight={700}>
            {users.filter((u) => u.status === "ACTIVE").length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg,#F59E0B,#FBBF24)",
            color: "#fff",
          }}
        >
          <Typography variant="body2">Administrators</Typography>
          <Typography variant="h4" fontWeight={700}>
            {users.filter((u) => u.role === "ADMIN").length}
          </Typography>
        </Paper>

        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
            color: "#fff",
          }}
        >
          <Typography variant="body2">Privileges</Typography>
          <Typography variant="h4" fontWeight={700}>
            {privileges.length}
          </Typography>
        </Paper>
      </Stack>

      <Divider sx={{ mb: 3 }} />

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
          onClick={createNewUser}
          sx={{
            height: 46,
            borderRadius: 3,
            px: 3,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          New User
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT PANEL */}

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              borderRadius: 4,
              p: 2.5,
              height: "82vh",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={2}>
              Users
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search User..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Stack spacing={2} mt={3}>
              {filteredUsers.length === 0 ? (
                <Paper
                  sx={{
                    p: 5,
                    textAlign: "center",
                    borderRadius: 3,
                    background: "#F9FAFB",
                  }}
                >
                  <PersonIcon
                    sx={{
                      fontSize: 50,
                      color: "#9CA3AF",
                    }}
                  />

                  <Typography mt={2}>No Users Found</Typography>
                </Paper>
              ) : (
                filteredUsers.map((user) => (
                  <Paper
                    key={user.id}
                    elevation={0}
                    onClick={() => editUser(user)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderRadius: 3,
                      border:
                        selectedUser?.id === user.id
                          ? "2px solid #1976d2"
                          : "1px solid #E5E7EB",

                      transition: ".25s",

                      "&:hover": {
                        borderColor: "#1976d2",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#1976d2" }}>
                        <Typography fontWeight="700" fontSize={22}>
                          {(user.username || "U").charAt(0).toUpperCase()}
                        </Typography>
                      </Avatar>

                      <Box flex={1}>
                        <Typography fontWeight={700}>
                          {user.username}
                        </Typography>

                        <Stack direction="row" spacing={1} mt={0.5}>
                          <Chip
                            size="small"
                            label={user.role}
                            color="primary"
                          />

                          <Chip
                            size="small"
                            label={user.status}
                            color={
                              user.status === "ACTIVE" ? "success" : "error"
                            }
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* RIGHT PANEL */}

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              borderRadius: 4,
              p: 3,
              minHeight: "82vh",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#1976d2",
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {editingUserId ? "Edit User" : "Create User"}
                </Typography>

                <Typography color="text.secondary">
                  Configure user details and permissions
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={userForm.username}
                  onChange={handleUserChange}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  value={userForm.password}
                  onChange={handleUserChange}
                />
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  name="role"
                  value={userForm.role}
                  onChange={handleRoleChange}
                >
                  <MenuItem value="ADMIN">ADMIN</MenuItem>

                  <MenuItem value="DOCTOR">DOCTOR</MenuItem>

                  <MenuItem value="RECEPTION">Reception</MenuItem>

                  <MenuItem value="STAFF">STAFF</MenuItem>
                </TextField>
              </Grid>

              <Grid xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={userForm.status}
                  onChange={handleUserChange}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>

                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* PART 3 WILL START HERE */}

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Privilege Management
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 3 }}
              >
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search Privilege..."
                  value={privilegeSearch}
                  onChange={(e) => setPrivilegeSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="outlined"
                  onClick={() =>
                    setSelectedPrivileges(privileges.map((p) => p.id))
                  }
                >
                  Select All
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setSelectedPrivileges([])}
                >
                  Clear All
                </Button>
              </Stack>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                {Object.entries(groupedPrivileges).map(([module, items]) => {
                  const filteredItems = items.filter((priv) => {
                    return getPrivilegeLabel(priv)
                      .toLowerCase()
                      .includes(privilegeSearch.toLowerCase());
                  });

                  if (privilegeSearch && filteredItems.length === 0) {
                    return null;
                  }

                  return (
                    <Accordion
                      key={module}
                      disableGutters
                      elevation={0}
                      expanded={expandedModule === module}
                      onChange={() =>
                        setExpandedModule(
                          expandedModule === module ? null : module,
                        )
                      }
                      sx={{
                        "&:before": {
                          display: "none",
                        },
                        borderBottom: "1px solid #E5E7EB",
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          minHeight: 56,
                          "& .MuiAccordionSummary-content": {
                            margin: 0,
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography fontWeight={700}>{module}</Typography>

                          <Chip
                            size="small"
                            color="primary"
                            label={getModuleCount(module)}
                          />
                        </Stack>
                      </AccordionSummary>

                      <AccordionDetails
                        sx={{
                          background: "#FAFAFA",
                        }}
                      >
                        <Grid container spacing={1}>
                          {filteredItems.map((priv) => (
                            <Grid size={{ xs: 12, md: 6 }} key={priv.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedPrivileges.includes(
                                      priv.id,
                                    )}
                                    onChange={() =>
                                      handlePrivilegeToggle(priv.id)
                                    }
                                  />
                                }
                                label={getPrivilegeLabel(priv)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Paper>
            </Box>

            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                background: "#fff",
                pt: 2,
                pb: 1,
                mt: 3,
                borderTop: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                disableElevation
                variant="contained"
                size="large"
                onClick={saveUser}
                sx={{
                  px: 5,
                  height: 48,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",

                  "&:hover": {
                    background: "linear-gradient(135deg,#1D4ED8,#1E40AF)",
                  },
                }}
              >
                {editingUserId ? "Update User" : "Save User"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

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
