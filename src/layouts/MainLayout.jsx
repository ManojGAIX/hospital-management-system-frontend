import React, { useState } from "react";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Button,
} from "@mui/material";

import { Outlet, useNavigate, useLocation } from "react-router-dom";

import LogoutIcon from "@mui/icons-material/Logout";

import Sidebar from "../components/Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

const drawerWidth = 260;

export default function MainLayout() {
  const navigate = useNavigate();

  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============================================
  // USER DATA FROM LOCAL STORAGE
  // ============================================

  const username = localStorage.getItem("username") || "User";

  const role = localStorage.getItem("role") || "STAFF";

  // ============================================
  // LOGOUT
  // ============================================

  const logout = () => {
    localStorage.clear();

    navigate("/login");
  };

  // ============================================
  // PAGE TITLES
  // ============================================

  const pageTitles = {
    "/dashboard": {
      title: "Hospital Overview",
      subtitle: "Real-time healthcare analytics and clinic performance",
    },

    "/patients": {
      title: "Patient Registry",
      subtitle: "Manage patient records and medical history",
    },

    "/appointments": {
      title: "Appointment Booking",
      subtitle: "Schedule and manage doctor consultations",
    },

    "/PatientProfile": {
      title: "Patient Profile",
      subtitle: "View Patient Profile records and medical history",
    },

    "/prescriptions": {
      title: "Prescription Management",
      subtitle: "Generate and manage digital prescriptions",
    },

    "/PharmacyBilling": {
      title: "Pharmacy Billing",
      subtitle: "Manage pharmacy sales and invoices",
    },

    "/PharmacyHistory": {
      title: "Pharmacy History",
      subtitle: "Manage pharmacy history and invoices",
    },

    "/labtests": {
      title: "Lab Test Management",
      subtitle: "Manage diagnostic reports and investigations",
    },

    "/LabResultEntry": {
      title: "Laboratory Result Entry",
      subtitle: "Enter Investigation Results",
    },

    "/beds": {
      title: "Ward & Bed Management",
      subtitle: "Monitor patient admissions and bed occupancy",
    },

    "/scanreports": {
      title: "Scan Reports",
      subtitle: "Manage MRI, CT Scan and X-Ray reports",
    },

    "/billing": {
      title: "Billing & Payments",
      subtitle: "Generate invoices and manage payments",
    },

    "/InvoiceHistory": {
      title: "Invoice History",
      subtitle: "Search invoices and History",
    },

    "/SupplierMaster": {
      title: "Supplier Master",
      subtitle: "Supplier Master Details",
    },

    "/PharmacyPurchase": {
      title: "Goods Reciept Note",
      subtitle: "Pharmacy Purchase Details",
    },

    "/PurchaseRegister": {
      title: "Purchase Register",
      subtitle: "View Pharmacy Purchase(GRN) Details",
    },

    "/CurrentStockRegister": {
      title: "CurrentStock Register",
      subtitle: "View CurrentStock Register Details",
    },

    "/medicines": {
      title: "Medicine Inventory",
      subtitle: "Manage medicines and stock quantities",
    },

    "/doctors": {
      title: "Staff Management",
      subtitle: "Manage staff profiles and departments",
    },

    "/userMaster": {
      title: "User Master",
      subtitle: "Configure User Prvilege settings",
    },

    "/physio": {
      title: "Physiotherapy Management",
      subtitle: "Manage rehabilitation sessions and patient recovery progress",
    },

    "/settings": {
      title: "System Configuration",
      subtitle:
        "Centrally manage, configure, or update active hospital operational billing tariffs.",
    },

    "/procedure-master": {
      title: "Procedure Master",
      subtitle: "Manage all clinical procedures and charges",
    },

    "/procedure-billing": {
      title: "Procedure Billing",
      subtitle: "Create procedure bills for OPD patients",
    },

    "/procedure-history": {
      title: "Procedure History",
      subtitle: "View and print procedure bills",
    },
  };

  const currentPage = pageTitles[location.pathname] || {
    title: "Hospital Management System",
    subtitle: "Welcome back",
  };

  return (
    <Box
      sx={{
        display: "flex",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* ============================================
          SIDEBAR
      ============================================ */}

      <Sidebar open={sidebarOpen} />

      {/* ============================================
          TOP APPBAR
      ============================================ */}

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: sidebarOpen ? `calc(100% - ${drawerWidth}px)` : "100%",

          ml: sidebarOpen ? `${drawerWidth}px` : "0px",

          transition: "all 0.3s ease",

          background: "rgba(255,255,255,0.85)",

          backdropFilter: "blur(15px)",

          color: "#0F172A",

          borderBottom: "1px solid #E2E8F0",

          boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            height: 80,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{ color: "#002366" }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                {currentPage.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                {currentPage.subtitle}
              </Typography>
            </Box>
          </Box>

          {/* ============================================
              PAGE TITLE
          ============================================ */}

          {/* ============================================
              USER SECTION
          ============================================ */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Box
              sx={{
                textAlign: "right",

                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                {username}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                {role}
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 44,
                height: 44,

                backgroundColor: "#002366",

                fontWeight: "bold",
              }}
            >
              {username?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Button
              color="error"
              variant="outlined"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                borderRadius: "10px",

                textTransform: "none",

                fontWeight: 700,
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ============================================
          MAIN CONTENT
      ============================================ */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: 0,
          ml: sidebarOpen ? `${drawerWidth}px` : 0,
          mt: "80px",
          p: 2,
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
