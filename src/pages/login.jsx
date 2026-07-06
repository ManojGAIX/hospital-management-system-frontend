import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Branding Colors
  const brandNavy = "#002366";
  const brandTeal = "#008374";

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/api/auth/login", {
        username,
        password,
      });

      // Store Auth Data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("auth", JSON.stringify(res.data));
      localStorage.setItem(
        "privileges",
        JSON.stringify(res.data.privileges || []),
      );
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover" /* Keeps aspect ratio intact and prevents blurriness/stretching on large monitors */,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        p: 2,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.25))",
        },
      }}
    >
      {/* Changed maxWidth to "xs" to make the login panel smaller and sharper */}
      <Container
        maxWidth="xs"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: "100%",
            maxWidth: 460 /* Reduced from 460 to make it look smaller */,
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.22)", // Transparent glassmorphism to show the background image
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          }}
        >
          {/* LOGO */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Hospital Logo"
              sx={{
                width: {
                  xs: 150,
                  sm: 180,
                } /* Reduced logo size to match smaller card */,
                maxWidth: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                backgroundColor: "#fff", // White badge background to keep the logo clear and distinct
                p: 1.5, // Padding inside the logo badge
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
          </Box>

          {/* ERROR */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, borderRadius: 2, fontSize: "0.85rem" }}
            >
              {error}
            </Alert>
          )}

          {/* USERNAME */}

          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              color: "#fff",
              mb: -1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            Username
          </Typography>

          <TextField
            fullWidth
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              mb: -1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* PASSWORD */}

          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "left",
              fontWeight: 600,
              color: "#fff",
              mb: -1,
              mt: 1,
              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          >
            Password
          </Typography>

          <TextField
            fullWidth
            placeholder="Enter Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#64748B" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* LOGIN BUTTON */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 3,

              py: 1.4,

              borderRadius: 3,

              background: "linear-gradient(135deg,#002366,#008374)",

              fontWeight: 700,

              fontSize: "1rem",

              textTransform: "none",

              boxShadow: "0 10px 25px rgba(0,35,102,0.35)",

              "&:hover": {
                background: "linear-gradient(135deg,#00184d,#00695c)",

                transform: "translateY(-2px)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "LOGIN"
            )}
          </Button>

          {/* FOOTER */}
          <Typography
            variant="caption"
            sx={{
              mt: 3,
              display: "block",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            © 2026 Madhav Hospital
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
