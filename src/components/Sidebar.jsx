import React, { useState } from "react";

import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import BedIcon from "@mui/icons-material/Bed";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HealingIcon from "@mui/icons-material/Healing";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ open, onItemClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const goTo = (path) => () => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const [openPatient, setOpenPatient] = useState(true);
  const [openDoctor, setOpenDoctor] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const [openPharmacy, setOpenPharmacy] = useState(false);
  const [openLab, setOpenLab] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openProcedure, setOpenProcedure] = useState(false);
  const [openInpatient, setOpenInpatient] = useState(false);
  const menuStyle = (path) => ({
    borderRadius: 2,
    mb: 0.5,
    backgroundColor:
      location.pathname === path ? "rgba(255,255,255,0.15)" : "transparent",

    borderLeft:
      location.pathname === path
        ? "4px solid #38bdf8"
        : "4px solid transparent",

    "&:hover": {
      background: "rgba(255,255,255,0.20)",

      borderLeft: "4px solid #06B6D4",
    },
  });

  return (
    <Box
      component="nav"
      sx={{
        width: open ? 260 : 0,
        minWidth: open ? 260 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.3s ease, min-width 0.3s ease",
        height: "100vh",
        background: "linear-gradient(180deg,#1E3A8A,#1E40AF)",
        color: "#fff",
        overflowY: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          width: 0,
          display: "none",
        },
      }}
    >
      {/* Header */}

      <Box sx={{ p: 3, textAlign: "center" }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Hospital Logo"
          sx={{
            width: 120,
            mb: 1,
          }}
        />

        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
          }}
        >
          MADHAV HOSPITAL
        </Typography>
      </Box>

      <Divider
        sx={{
          borderColor: "rgba(255,255,255,0.15)",
        }}
      />

      <List sx={{ p: 1 }}>
        {/* Dashboard */}

        <ListItemButton onClick={goTo("/dashboard")} sx={menuStyle("/dashboard")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <DashboardIcon />
          </ListItemIcon>

          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* Patient Management */}

        <ListItemButton onClick={() => setOpenPatient(!openPatient)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <PeopleIcon />
          </ListItemIcon>

          <ListItemText primary="Patient" />

          {openPatient ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openPatient}>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/patients")}
              sx={{ ...menuStyle("/patients"), pl: 6 }}
            >
              <ListItemText primary="Registration" />
            </ListItemButton>

            {/* <ListItemButton onClick={goTo("/visits")} sx={{ pl: 6 }}>
              <ListItemText primary="Visits" />
            </ListItemButton> */}

            <ListItemButton
              onClick={goTo("/appointments")}
              sx={{ ...menuStyle("/appointments"), pl: 6 }}
            >
              <ListItemText primary="Appointments" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/PatientProfile")}
              sx={{ ...menuStyle("/PatientProfile"), pl: 6 }}
            >
              <ListItemText primary="Patient Profile" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Doctor */}

        <ListItemButton onClick={() => setOpenDoctor(!openDoctor)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <LocalHospitalIcon />
          </ListItemIcon>

          <ListItemText primary="Doctor" />

          {openDoctor ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openDoctor}>
          <List component="div" disablePadding>
            {/* <ListItemButton component={Link} to="/consultation" sx={{ pl: 6 }}>
              <ListItemText primary="Consultation" />
            </ListItemButton> */}

            <ListItemButton
              onClick={goTo("/prescriptions")}
              sx={{ ...menuStyle("/prescriptions"), pl: 6 }}
            >
              <ListItemText primary="Prescriptions" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Billing */}

        <ListItemButton onClick={() => setOpenBilling(!openBilling)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <ReceiptIcon />
          </ListItemIcon>

          <ListItemText primary="Billing" />

          {openBilling ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openBilling}>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/billing")}
              sx={{ ...menuStyle("/billing"), pl: 6 }}
            >
              <ListItemText primary="Invoice Billing" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/invoice-history")}
              sx={{ ...menuStyle("/invoice-history"), pl: 6 }}
            >
              <ListItemText primary="Invoice History" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* ============================================
    PROCEDURE
============================================ */}

        <ListItemButton
          onClick={() => setOpenProcedure(!openProcedure)}
          sx={{
            borderRadius: 2,
            mb: 1,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.12)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <HealingIcon />
          </ListItemIcon>

          <ListItemText
            primary="Procedure"
            primaryTypographyProps={{
              color: "#fff",
              fontWeight: 600,
            }}
          />

          {openProcedure ? (
            <ExpandLess sx={{ color: "#fff" }} />
          ) : (
            <ExpandMore sx={{ color: "#fff" }} />
          )}
        </ListItemButton>

        <Collapse in={openProcedure} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Procedure Master */}

            <ListItemButton
              onClick={goTo("/procedure-master")}
              sx={{
                ...menuStyle("/procedure-master"),
                pl: 6,
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 35 }}>
                <HealingIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Procedure Master"
                primaryTypographyProps={{
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </ListItemButton>

            {/* Procedure Billing */}

            <ListItemButton
              onClick={goTo("/procedure-billing")}
              sx={{
                ...menuStyle("/procedure-billing"),
                pl: 6,
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 35 }}>
                <ReceiptLongIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Procedure Billing"
                primaryTypographyProps={{
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </ListItemButton>

            {/* Procedure History */}

            <ListItemButton
              onClick={goTo("/procedure-history")}
              sx={{
                ...menuStyle("/procedure-history"),
                pl: 6,
                borderRadius: 2,
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 35 }}>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText
                primary="Procedure History"
                primaryTypographyProps={{
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Pharmacy */}

        <ListItemButton onClick={() => setOpenPharmacy(!openPharmacy)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <MedicationIcon />
          </ListItemIcon>

          <ListItemText primary="Pharmacy" />

          {openPharmacy ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openPharmacy}>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/PharmacyBilling")}
              sx={{ ...menuStyle("/PharmacyBilling"), pl: 6 }}
            >
              <ListItemText primary="Billing" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/PharmacyHistory")}
              sx={{ ...menuStyle("/PharmacyHistory"), pl: 6 }}
            >
              <ListItemText primary="Billing History" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Laboratory */}

        <ListItemButton onClick={() => setOpenLab(!openLab)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <ScienceIcon />
          </ListItemIcon>

          <ListItemText primary="Laboratory" />

          {openLab ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openLab}>
          
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/labtests")}
              sx={{ ...menuStyle("/labtests"), pl: 6 }}
            >
              <ListItemText primary="Lab Tests" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/LabResultEntry")}
              sx={{ ...menuStyle("/LabResultEntry"), pl: 6 }}
            >
              <ListItemText primary="Result Entry" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/scanreports")}
              sx={{ ...menuStyle("/scanreports"), pl: 6 }}
            >
              <ListItemText primary="Reports" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Inventory */}

        <ListItemButton onClick={() => setOpenInventory(!openInventory)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <MedicationIcon />
          </ListItemIcon>

          <ListItemText primary="Inventory" />

          {openInventory ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openInventory}>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/medicines")}
              sx={{ ...menuStyle("/medicines"), pl: 6 }}
            >
              <ListItemText primary="Medicines" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/SupplierMaster")}
              sx={{ ...menuStyle("/SupplierMaster"), pl: 6 }}
            >
              <ListItemText primary="Suppliers" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/PharmacyPurchase")}
              sx={{ ...menuStyle("/PharmacyPurchase"), pl: 6 }}
            >
              <ListItemText primary="GRN" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/PurchaseRegister")}
              sx={{ ...menuStyle("/PurchaseRegister"), pl: 6 }}
            >
              <ListItemText primary="Purchase Register" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/CurrentStockRegister")}
              sx={{ ...menuStyle("/CurrentStockRegister"), pl: 6 }}
            >
              <ListItemText primary="CurrentStock Register" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/PurchaseReturn")}
              sx={{ ...menuStyle("/PurchaseReturn"), pl: 6 }}
            >
              <ListItemText primary="Purchase Return" />
            </ListItemButton>

          </List>
        </Collapse>

        {/* Inpatient Collapsible Menu */}

        <ListItemButton onClick={() => setOpenInpatient(!openInpatient)}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <BedIcon />
          </ListItemIcon>

          <ListItemText primary="Inpatient" />

          {openInpatient ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openInpatient}>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={goTo("/beds")}
              sx={{ ...menuStyle("/beds"), pl: 6 }}
            >
              <ListItemText primary="Beds & Wards" />
            </ListItemButton>

            <ListItemButton
              onClick={goTo("/discharge-summary")}
              sx={{ ...menuStyle("/discharge-summary"), pl: 6 }}
            >
              <ListItemText primary="Discharge Summary" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={goTo("/physio")} sx={menuStyle("/physio")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <FitnessCenterIcon />
          </ListItemIcon>

          <ListItemText primary="Physiotherapy" />
        </ListItemButton>

        <ListItemButton onClick={goTo("/doctors")} sx={menuStyle("/doctors")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <LocalHospitalIcon />
          </ListItemIcon>

          <ListItemText primary="Staff" />
        </ListItemButton>

        <ListItemButton
          onClick={goTo("/userMaster")}
          sx={menuStyle("/userMaster")}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <ManageAccountsIcon />
          </ListItemIcon>

          <ListItemText primary="User & Roles" />
        </ListItemButton>

        <ListItemButton onClick={goTo("/settings")} sx={menuStyle("/settings")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsIcon />
          </ListItemIcon>

          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
    </Box>
  );
}
