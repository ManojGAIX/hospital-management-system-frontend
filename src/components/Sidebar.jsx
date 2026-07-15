import React, { useEffect, useMemo, useState } from "react";

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
import BadgeIcon from "@mui/icons-material/Badge";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HealingIcon from "@mui/icons-material/Healing";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import BiotechIcon from "@mui/icons-material/Biotech";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ApartmentIcon from "@mui/icons-material/Apartment";
import WorkIcon from "@mui/icons-material/Work";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PaymentsIcon from "@mui/icons-material/Payments";
import FolderIcon from "@mui/icons-material/Folder";
import SummarizeIcon from "@mui/icons-material/Summarize";

import { useLocation, useNavigate } from "react-router-dom";

const sidebarWidth = 284;

const subLinkIcons = {
  "/patients": PersonAddIcon,
  "/appointments": EventIcon,
  "/PatientProfile": AccountCircleIcon,
  "/prescriptions": DescriptionIcon,
  "/billing": RequestQuoteIcon,
  "/invoice-history": HistoryIcon,
  "/labtests": BiotechIcon,
  "/LabResultEntry": EditNoteIcon,
  "/scanreports": AssessmentIcon,
  "/PharmacyBilling": PointOfSaleIcon,
  "/PharmacyHistory": HistoryIcon,
  "/medicines": Inventory2Icon,
  "/SupplierMaster": LocalShippingIcon,
  "/PharmacyPurchase": ReceiptLongIcon,
  "/PurchaseRegister": ListAltIcon,
  "/CurrentStockRegister": WarehouseIcon,
  "/PurchaseReturn": AssignmentReturnIcon,
  "/hr": DashboardIcon,
  "/hr/employees": BadgeIcon,
  "/hr/departments": ApartmentIcon,
  "/hr/designations": WorkIcon,
  "/hr/roles": AdminPanelSettingsIcon,
  "/hr/attendance": FactCheckIcon,
  "/hr/shifts": ScheduleIcon,
  "/hr/leave": EventBusyIcon,
  "/hr/holidays": EventIcon,
  "/hr/payroll": PaymentsIcon,
  "/hr/documents": FolderIcon,
  "/hr/reports": SummarizeIcon,
  "/beds": BedIcon,
  "/discharge-summary": DescriptionIcon,
};

const menuGroups = [
  {
    id: "patient",
    label: "Patient",
    icon: PeopleIcon,
    children: [
      { label: "Registration", path: "/patients" },
      { label: "Appointments", path: "/appointments", icon: EventIcon },
      { label: "Patient Profile", path: "/PatientProfile" },
    ],
  },
  {
    id: "doctor",
    label: "Doctor",
    icon: LocalHospitalIcon,
    children: [{ label: "Prescriptions", path: "/prescriptions" }],
  },
  {
    id: "billing",
    label: "Billing",
    icon: ReceiptIcon,
    children: [
      { label: "Invoice Billing", path: "/billing" },
      { label: "Invoice History", path: "/invoice-history" },
    ],
  },
  {
    id: "procedure",
    label: "Procedure",
    icon: HealingIcon,
    children: [
      { label: "Procedure Master", path: "/procedure-master", icon: HealingIcon },
      { label: "Procedure Billing", path: "/procedure-billing", icon: ReceiptLongIcon },
      { label: "Procedure History", path: "/procedure-history", icon: HistoryIcon },
    ],
  },
  {
    id: "laboratory",
    label: "Laboratory",
    icon: ScienceIcon,
    children: [
      { label: "Lab Tests", path: "/labtests" },
      { label: "Result Entry", path: "/LabResultEntry" },
      { label: "Reports", path: "/scanreports" },
    ],
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: MedicationIcon,
    children: [
      { label: "Billing", path: "/PharmacyBilling" },
      { label: "Billing History", path: "/PharmacyHistory" },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: MedicationIcon,
    children: [
      { label: "Medicines", path: "/medicines" },
      { label: "Suppliers", path: "/SupplierMaster" },
      { label: "GRN", path: "/PharmacyPurchase" },
      // { label: "Purchase Register", path: "/PurchaseRegister" },
      { label: "Current Stock", path: "/CurrentStockRegister" },
      { label: "Purchase Return", path: "/PurchaseReturn" },
    ],
  },
  {
    id: "hr",
    label: "HR",
    icon: BadgeIcon,
    children: [
      { label: "HR Dashboard", path: "/hr" },
      { label: "Employees", path: "/hr/employees" },
      { label: "Departments", path: "/hr/departments" },
      { label: "Designations", path: "/hr/designations" },
      { label: "Roles", path: "/hr/roles" },
      { label: "Attendance", path: "/hr/attendance" },
      { label: "Shifts", path: "/hr/shifts" },
      { label: "Leave", path: "/hr/leave" },
      { label: "Holidays", path: "/hr/holidays" },
      { label: "Payroll", path: "/hr/payroll" },
      { label: "Documents", path: "/hr/documents" },
      { label: "Reports", path: "/hr/reports" },
    ],
  },  {
    id: "inpatient",
    label: "Inpatient",
    icon: BedIcon,
    children: [
      { label: "Beds & Wards", path: "/beds" },
      { label: "Discharge Summary", path: "/discharge-summary" },
    ],
  },
];

const directMenuItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardIcon },
  { label: "Physiotherapy", path: "/physio", icon: FitnessCenterIcon },
  { label: "Staff", path: "/doctors", icon: LocalHospitalIcon },
  { label: "User & Roles", path: "/userMaster", icon: ManageAccountsIcon },
  { label: "Settings", path: "/settings", icon: SettingsIcon },
];

export default function Sidebar({ open, onItemClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const permissions = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("permissions") || "[]");
    } catch {
      return [];
    }
  }, []);

  const role = localStorage.getItem("role") || "";
  const hasPermission = (path) => permissions.includes(path) || (role === "ADMIN" && path.startsWith("/hr"));

  const activeGroup = menuGroups.find((group) =>
    group.children.some((item) => item.path === location.pathname)
  );

  const [openGroups, setOpenGroups] = useState(() => ({
    [activeGroup?.id]: true,
  }));

  useEffect(() => {
    if (activeGroup?.id) {
      setOpenGroups((current) => ({ ...current, [activeGroup.id]: true }));
    }
  }, [activeGroup?.id]);

  const goTo = (path) => () => {
    navigate(path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const toggleGroup = (id) => {
    setOpenGroups((current) => ({ ...current, [id]: !current[id] }));
  };

  const itemStyle = (path, nested = false) => {
    const active = location.pathname === path;

    return {
      minHeight: nested ? 38 : 44,
      px: 1.5,
      py: nested ? 0.75 : 1,
      pl: nested ? 5.75 : 1.5,
      mb: 0.35,
      borderRadius: "10px",
      color: "#fff",
      backgroundColor: active ? "rgba(255,255,255,0.16)" : "transparent",
      border: "1px solid",
      borderColor: active ? "rgba(255,255,255,0.18)" : "transparent",
      boxShadow: active ? "inset 3px 0 0 #38bdf8" : "inset 3px 0 0 transparent",
      transition: "background 0.18s ease, border-color 0.18s ease",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderColor: "rgba(255,255,255,0.12)",
      },
      "& .MuiListItemIcon-root": {
        minWidth: nested ? 32 : 40,
        color: active ? "#ffffff" : "#dbeafe",
      },
      "& .MuiListItemText-primary": {
        fontSize: nested ? 13 : 14,
        fontWeight: active ? 800 : nested ? 500 : 650,
        lineHeight: 1.25,
      },
    };
  };

  const groupStyle = (isActive) => ({
    ...itemStyle("", false),
    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    borderColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    boxShadow: isActive ? "inset 3px 0 0 #38bdf8" : "inset 3px 0 0 transparent",
    "& .MuiListItemText-primary": {
      fontSize: 14,
      fontWeight: 750,
      lineHeight: 1.25,
    },
  });

  return (
    <Box
      component="nav"
      sx={{
        width: open ? sidebarWidth : 0,
        minWidth: open ? sidebarWidth : 0,
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
        height: "100vh",
        overflow: "hidden auto",
        transition: "width 0.25s ease, min-width 0.25s ease",
        background: "linear-gradient(180deg, #082f49 0%, #0f3f68 48%, #123456 100%)",
        color: "#fff",
        borderRight: "1px solid rgba(15,23,42,0.08)",
        boxShadow: open ? "8px 0 24px rgba(15,23,42,0.08)" : "none",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        "&::-webkit-scrollbar": {
          width: 0,
          display: "none",
        },
      }}
    >
      <Box sx={{ px: 2.25, py: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Hospital Logo"
            sx={{
              width: 52,
              height: 52,
              objectFit: "contain",
              borderRadius: "12px",
              backgroundColor: "#fff",
              p: 0.5,
            }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: 0 }}
            >
              MADHAV
            </Typography>

            <Typography variant="caption" sx={{ color: "#bfdbfe", fontWeight: 600 }}>
              Hospital Management
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

      <List sx={{ px: 1.25, py: 1.5 }}>
        {directMenuItems
          .filter((item) => hasPermission(item.path))
          .slice(0, 1)
          .map((item) => {
            const Icon = item.icon;

            return (
              <ListItemButton key={item.path} onClick={goTo(item.path)} sx={itemStyle(item.path)}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}

        {menuGroups.map((group) => {
          const visibleChildren = group.children.filter((item) => hasPermission(item.path));
          if (!visibleChildren.length) {
            return null;
          }

          const Icon = group.icon;
          const isActive = visibleChildren.some((item) => item.path === location.pathname);
          const expanded = Boolean(openGroups[group.id]);

          return (
            <Box key={group.id}>
              <ListItemButton onClick={() => toggleGroup(group.id)} sx={groupStyle(isActive)}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={group.label} />
                {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
              </ListItemButton>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {visibleChildren.map((item) => {
                    const ChildIcon = item.icon || subLinkIcons[item.path] || group.icon;

                    return (
                      <ListItemButton
                        key={item.path}
                        onClick={goTo(item.path)}
                        sx={itemStyle(item.path, true)}
                      >
                        {ChildIcon && (
                          <ListItemIcon>
                            <ChildIcon fontSize="small" />
                          </ListItemIcon>
                        )}
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })}

        <Divider sx={{ my: 1.25, borderColor: "rgba(255,255,255,0.12)" }} />

        {directMenuItems
          .filter((item) => item.path !== "/dashboard" && hasPermission(item.path))
          .map((item) => {
            const Icon = item.icon;

            return (
              <ListItemButton key={item.path} onClick={goTo(item.path)} sx={itemStyle(item.path)}>
                <ListItemIcon>
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
      </List>
    </Box>
  );
}










