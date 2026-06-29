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

import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open }) {
  const location = useLocation();

  const [openPatient, setOpenPatient] = useState(true);
  const [openDoctor, setOpenDoctor] = useState(false);
  const [openBilling, setOpenBilling] = useState(false);
  const [openPharmacy, setOpenPharmacy] = useState(false);
  const [openLab, setOpenLab] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openProcedure, setOpenProcedure] = useState(false);
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
      sx={{
        width: open ? 260 : 0,
        overflow: "hidden",
        transition: "all 0.3s ease",
        height: "100vh",
        //  background: "linear-gradient(180deg,#002366 0%,#001845 100%)",
        background: "linear-gradient(180deg,#1E3A8A,#1E40AF)",
        // boxShadow: "4px 0 25px rgba(0,0,0,0.08)",
        color: "#fff",
        position: "fixed",
        left: 0,
        top: 0,
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
          src="/logo.PNG"
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

        <ListItemButton
          component={Link}
          to="/dashboard"
          sx={menuStyle("/dashboard")}
        >
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
            <ListItemButton component={Link} to="/patients" sx={{ pl: 6 }}>
              <ListItemText primary="Registration" />
            </ListItemButton>

            {/* <ListItemButton component={Link} to="/visits" sx={{ pl: 6 }}>
              <ListItemText primary="Visits" />
            </ListItemButton> */}

            <ListItemButton component={Link} to="/appointments" sx={{ pl: 6 }}>
              <ListItemText primary="Appointments" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/PatientProfile"
              sx={{ pl: 6 }}
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

            <ListItemButton component={Link} to="/prescriptions" sx={{ pl: 6 }}>
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
            <ListItemButton component={Link} to="/billing" sx={{ pl: 6 }}>
              <ListItemText primary="Invoice Billing" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/invoice-history"
              sx={{ pl: 6 }}
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
              component={Link}
              to="/procedure-master"
              sx={{
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
              component={Link}
              to="/procedure-billing"
              sx={{
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
              component={Link}
              to="/procedure-history"
              sx={{
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
              component={Link}
              to="/PharmacyBilling"
              sx={{ pl: 6 }}
            >
              <ListItemText primary="Billing" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/PharmacyHistory"
              sx={{ pl: 6 }}
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
            <ListItemButton component={Link} to="/labtests" sx={{ pl: 6 }}>
              <ListItemText primary="Lab Tests" />
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/LabResultEntry"
              sx={{ pl: 6 }}
            >
              <ListItemText primary="Result Entry" />
            </ListItemButton>

            <ListItemButton component={Link} to="/scanreports" sx={{ pl: 6 }}>
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
            <ListItemButton component={Link} to="/medicines" sx={{ pl: 6 }}>
              <ListItemText primary="Medicines" />
            </ListItemButton>

             <ListItemButton component={Link} to="/SupplierMaster" sx={{ pl: 6 }}>
              <ListItemText primary="Suppliers" />
            </ListItemButton>

            <ListItemButton component={Link} to="/PharmacyPurchase" sx={{ pl: 6 }}>
              <ListItemText primary="GRN" />
            </ListItemButton>

            <ListItemButton component={Link} to="/PurchaseRegister" sx={{ pl: 6 }}>
              <ListItemText primary="Purchase Register" />
            </ListItemButton>
            
            <ListItemButton component={Link} to="/CurrentStockRegister" sx={{ pl: 6 }}>
              <ListItemText primary="CurrentStock Register" />
            </ListItemButton> 

             <ListItemButton component={Link} to="/PurchaseReturn" sx={{ pl: 6 }}>
              <ListItemText primary="Purchase Return" />
            </ListItemButton> 

          </List>
        </Collapse>

        {/* Standalone Menus */}

        <ListItemButton component={Link} to="/beds" sx={menuStyle("/beds")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <BedIcon />
          </ListItemIcon>

          <ListItemText primary="Inpatient" />
        </ListItemButton>

        <ListItemButton component={Link} to="/physio" sx={menuStyle("/physio")}>
          <ListItemIcon sx={{ color: "#fff" }}>
            <FitnessCenterIcon />
          </ListItemIcon>

          <ListItemText primary="Physiotherapy" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/doctors"
          sx={menuStyle("/doctors")}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <LocalHospitalIcon />
          </ListItemIcon>

          <ListItemText primary="Staff" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/userMaster"
          sx={menuStyle("/userMaster")}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <ManageAccountsIcon />
          </ListItemIcon>

          <ListItemText primary="User & Roles" />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/settings"
          sx={menuStyle("/settings")}
        >
          <ListItemIcon sx={{ color: "#fff" }}>
            <SettingsIcon />
          </ListItemIcon>

          <ListItemText primary="Settings" />
        </ListItemButton>
      </List>
    </Box>
  );
}
