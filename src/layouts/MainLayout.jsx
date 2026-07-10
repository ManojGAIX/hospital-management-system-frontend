import React, { useState, useEffect } from "react";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import { Outlet, useNavigate, useLocation, Navigate } from "react-router-dom";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width:900px)");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop, location.pathname]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const username = localStorage.getItem("username") || "User";
  const role = localStorage.getItem("role") || "STAFF";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error("Fullscreen mode failed", error);
    }
  };

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
      subtitle: "Enter investigation results",
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
    "/invoice-history": {
      title: "Invoice History",
      subtitle: "Search invoices and history",
    },
    "/SupplierMaster": {
      title: "Supplier Master",
      subtitle: "Manage supplier details",
    },
    "/PharmacyPurchase": {
      title: "Goods Receipt Note",
      subtitle: "Manage pharmacy purchase details",
    },
    "/PurchaseRegister": {
      title: "Purchase Register",
      subtitle: "View pharmacy purchase details",
    },
    "/CurrentStockRegister": {
      title: "Current Stock Register",
      subtitle: "View available pharmacy stock",
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
      subtitle: "Configure user privilege settings",
    },
    "/physio": {
      title: "Physiotherapy Management",
      subtitle: "Manage rehabilitation sessions and patient recovery progress",
    },
    "/settings": {
      title: "System Configuration",
      subtitle: "Manage hospital operational billing tariffs",
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
    "/PurchaseReturn": {
      title: "Purchase Return",
      subtitle: "Manage pharmacy purchase returns",
    },
    "/hr": {
      title: "HR Dashboard",
      subtitle: "Human resources operations and workforce analytics",
    },
    "/hr/employees": {
      title: "Employee Master",
      subtitle: "Register employees, documents, reporting and bank details",
    },
    "/hr/departments": {
      title: "Department Management",
      subtitle: "Create, edit and disable hospital departments",
    },
    "/hr/designations": {
      title: "Designation Management",
      subtitle: "Map designations to departments and grades",
    },
    "/hr/roles": {
      title: "Employee Role Management",
      subtitle: "Assign HR roles, user type, department and permissions",
    },
    "/hr/attendance": {
      title: "Attendance Management",
      subtitle: "Daily attendance, overtime, late entry, half day and absence",
    },
    "/hr/shifts": {
      title: "Shift Management",
      subtitle: "Create and assign morning, evening, night and emergency shifts",
    },
    "/hr/leave": {
      title: "Leave Management",
      subtitle: "Leave workflow with manager and HR approvals",
    },
    "/hr/holidays": {
      title: "Holiday Calendar",
      subtitle: "National, festival, weekly off and department holidays",
    },
    "/hr/payroll": {
      title: "Payroll Processing",
      subtitle: "Salary master, deductions, payslip and salary register",
    },
    "/hr/documents": {
      title: "Employee Documents",
      subtitle: "Version control, expiry notification and compliance tracking",
    },
    "/hr/reports": {
      title: "HR Reports",
      subtitle: "Employee, attendance, leave, payroll, shift and appraisal reports",
    },
    "/discharge-summary": {
      title: "Discharge Summary",
      subtitle: "Manage patient clinical discharge summaries and documents",
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
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#eef3f8",
        overflow: "hidden",
      }}
    >
      <Sidebar open={sidebarOpen} onItemClick={() => setSidebarOpen(false)} />

      {sidebarOpen && !isDesktop && (
        <Box
          onClick={() => setSidebarOpen(false)}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9,
            backgroundColor: "rgba(15,23,42,0.38)",
          }}
        />
      )}

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            flexShrink: 0,
            width: "100%",
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(16px)",
            color: "#0f172a",
            borderBottom: "1px solid #dbe4ee",
            boxShadow: "0 10px 30px rgba(15,23,42,0.05)",
            zIndex: 8,
          }}
        >
          <Toolbar
            sx={{
              minHeight: { xs: 66, sm: 74 },
              px: { xs: 1.5, sm: 2.5, md: 3 },
              gap: 1.5,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Tooltip title={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
                <IconButton
                  onClick={() => setSidebarOpen((current) => !current)}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#0f3f68",
                    backgroundColor: "#eef6fb",
                    border: "1px solid #d8e6ef",
                    "&:hover": { backgroundColor: "#e1eff7" },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h5"
                  noWrap
                  sx={{
                    maxWidth: { xs: "44vw", sm: "56vw", md: "none" },
                    fontSize: { xs: 18, sm: 22 },
                    fontWeight: 850,
                    color: "#0f172a",
                    lineHeight: 1.15,
                    letterSpacing: 0,
                  }}
                >
                  {currentPage.title}
                </Typography>

                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    maxWidth: { xs: "44vw", sm: "56vw", md: "none" },
                    color: "#64748b",
                    fontWeight: 600,
                    mt: 0.35,
                  }}
                >
                  {currentPage.subtitle}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5 } }}>
              <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    width: 42,
                    height: 42,
                    color: "#0f3f68",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #dbe4ee",
                    "&:hover": { backgroundColor: "#eef6fb" },
                  }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>

              <Box sx={{ textAlign: "right", display: { xs: "none", md: "block" } }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1e293b" }}>
                  {username}
                </Typography>

                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                  {role}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  backgroundColor: "#0f3f68",
                  fontWeight: 800,
                  border: "2px solid #e2edf5",
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
                  minHeight: 40,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 800,
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            minHeight: 0,
            p: { xs: 1.5, md: 2.25 },
            overflow: "auto",
            boxSizing: "border-box",
            backgroundColor: "#eef3f8",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              width: 0,
              height: 0,
              display: "none",
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}




