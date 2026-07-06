import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Divider,
  Paper,
  Stack,
  Tabs,
  Tab,
  MenuItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import api from "../services/api";

export default function SystemSettings() {
  const [configs, setConfigs] = useState([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [newCategory, setNewCategory] = useState("BILLING");

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await api.get("/api/configs");
      setConfigs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch failed:", err);
      setConfigs([{ configKey: "CONSULTATION_FEE", configValue: "500" }]);
    }
  };

  // --- ADD NEW ENTRY ---
  const handleAdd = async () => {
    if (!newKey) return alert("Key name is required");
    const formattedKey = newKey.toUpperCase().replace(/\s+/g, "_");
    const exists = configs.some((c) => c.configKey === formattedKey);

    if (exists) {
      alert("Configuration already exists");
      return;
    }
    const payload = {
      configKey: formattedKey,
      configValue: newValue || "0",
      category: newCategory,
    };

    try {
      await api.post("/api/configs/save", payload);
      setNewKey("");
      setNewValue("");
      fetchConfigs();
      alert("Saved successfully!");
    } catch (err) {
      alert("Error adding key");
    }
  };

  // --- UPDATE VALUE ---
  const handleSave = async (config) => {
    try {
      await api.post("/api/configs/save", config);
      alert("Updated successfully!");
    } catch (err) {
      alert("Update failed");
    }
  };

  // --- DELETE ENTRY ---
  const handleDelete = async (key) => {
    if (!window.confirm(`Delete ${key}?`)) return;
    try {
      await api.delete(`/api/configs/${key}`);
      fetchConfigs();
    } catch (err) {
      alert("Delete failed. Check if Delete endpoint exists.");
    }
  };

  const handleChange = (key, value) => {
    setConfigs((prev) =>
      prev.map((c) => (c.configKey === key ? { ...c, configValue: value } : c)),
    );
  };

  // --- CATEGORIZATION LOGIC ---

  const categorizeConfigs = () => {
    return {
      OPD: configs.filter((c) => (c.category || "").toUpperCase() === "OPD"),

      IPD: configs.filter((c) => (c.category || "").toUpperCase() === "IPD"),

      LAB: configs.filter((c) => (c.category || "").toUpperCase() === "LAB"),

      BILLING: configs.filter(
        (c) => (c.category || "").toUpperCase() === "BILLING",
      ),

      PHYSIO: configs.filter(
        (c) => (c.category || "").toUpperCase() === "PHYSIO",
      ),
    };
  };

  const categorizedData = categorizeConfigs();

  const tabKeys = ["OPD", "IPD", "LAB", "BILLING", "PHYSIO"];

  const visibleConfigs = categorizedData[tabKeys[activeTab]] || [];

  // Clean labels helper for beautiful UI presentation
  const formatLabel = (key) => {
    return key
      .replace(/^BED_|^LAB_/, "")
      .replace(/_/g, " ")
      .trim();
  };

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* --- PAGE HEADER --- */}

      {/* --- ADD NEW KEY SECTION --- */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: "#1e3a8a",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Create Operational Service Parameter
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Service Name (e.g. BED_ICU, LAB_GLUCOSE)"
              variant="outlined"
              size="small"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="e.g. BED_ICU"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Base Tariff Amount"
              type="number"
              variant="outlined"
              size="small"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Category"
              size="small"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <MenuItem value="OPD">OPD</MenuItem>
              <MenuItem value="IPD">IPD</MenuItem>
              <MenuItem value="LAB">LAB</MenuItem>
              <MenuItem value="BILLING">BILLING</MenuItem>
              <MenuItem value="PHYSIO">PHYSIO</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={handleAdd}
              sx={{
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
              Add Param
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* --- CATEGORY TABS --- */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          mb: 3,
          borderRadius: "18px",

          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",

          border: "1px solid rgba(255,255,255,0.4)",

          boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{
            style: {
              display: "none",
            },
          }}
          sx={{
            minHeight: 52,

            "& .MuiTabs-flexContainer": {
              gap: 1,
            },
          }}
        >
          {[
            { label: "OPD", count: categorizedData.OPD?.length || 0 },
            { label: "IPD", count: categorizedData.IPD?.length || 0 },
            { label: "LAB", count: categorizedData.LAB?.length || 0 },
            { label: "BILLING", count: categorizedData.BILLING?.length || 0 },
            { label: "PHYSIO", count: categorizedData.PHYSIO?.length || 0 },
          ].map((tab, index) => (
            <Tab
              key={tab.label}
              label={`${tab.label} (${tab.count})`}
              sx={{
                minHeight: 46,

                borderRadius: "14px",

                textTransform: "none",

                fontWeight: 700,
                fontSize: "0.9rem",

                color: "#475569",

                transition: "all 0.3s ease",

                "&:hover": {
                  backgroundColor: "#E0F2FE",
                  color: "#1E40AF",
                },

                "&.Mui-selected": {
                  color: "#fff",

                  background: "linear-gradient(135deg,#1E40AF,#06B6D4)",

                  boxShadow: "0 8px 20px rgba(30,64,175,0.25)",
                },
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* --- CONFIGURATIONS ACTIVE CARDS GRID LIST --- */}
      <Grid container spacing={2.5}>
        {visibleConfigs.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ py: 6, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{ color: "#64748b", fontWeight: 600 }}
              >
                No active configuration keys mapped under this category tab.
              </Typography>
            </Box>
          </Grid>
        ) : (
          visibleConfigs.map((item) => (
            <Grid item xs={12} md={6} key={item.configKey}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  transition: "0.2s",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 2,
                    "&:last-child": { pb: 2 },
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ flexGrow: 1, pr: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.3,
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor:
                            item.category === "OPD"
                              ? "#dbeafe"
                              : item.category === "IPD"
                                ? "#dcfce7"
                                : item.category === "LAB"
                                  ? "#fef3c7"
                                  : "#ede9fe",

                          color:
                            item.category === "OPD"
                              ? "#1e40af"
                              : item.category === "IPD"
                                ? "#166534"
                                : item.category === "LAB"
                                  ? "#92400e"
                                  : "#6d28d9",
                        }}
                      >
                        {item.category}
                      </Typography>
                    </Box>

                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        color: "#64748b",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 0.5,
                      }}
                    >
                      {formatLabel(item.configKey)}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#94a3b8",
                        display: "block",
                        fontSize: "10px",
                        mb: 1,
                        fontWeight: 600,
                      }}
                    >
                      System Ref: {item.configKey}
                    </Typography>

                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      value={item.configValue || ""}
                      onChange={(e) =>
                        handleChange(item.configKey, e.target.value)
                      }
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">₹</InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignSelf: "flex-end", mb: 0.25 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleSave(item)}
                      title="Save Changes"
                      sx={{
                        color: "#1e3a8a",
                        backgroundColor: "#f0f4ff",
                        borderRadius: 2,
                        p: 0.75,
                        "&:hover": { backgroundColor: "#dbeafe" },
                      }}
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.configKey)}
                      title="Remove Row"
                      sx={{
                        color: "#ef4444",
                        backgroundColor: "#fef2f2",
                        borderRadius: 2,
                        p: 0.75,
                        "&:hover": { backgroundColor: "#fee2e2" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
