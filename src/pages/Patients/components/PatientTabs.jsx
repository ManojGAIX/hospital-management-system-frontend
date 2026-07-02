import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import FolderSharedIcon from "@mui/icons-material/FolderShared";

export default function PatientTabs({ value, onChange }) {
  return (
    <Box
      sx={{
        px: 2,
        pt: 2,
        borderBottom: "1px solid #E5E7EB",
        backgroundColor: "#fff",
      }}
    >
      <Tabs
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          minHeight: 58,

          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: "4px 4px 0 0",
            backgroundColor: "#1E40AF",
          },

          "& .MuiTab-root": {
            minHeight: 58,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "#64748B",
            transition: "all .25s ease",
          },

          "& .Mui-selected": {
            color: "#1E40AF",
            fontWeight: 700,
          },
        }}
      >
        <Tab
          icon={<PersonAddAlt1Icon />}
          iconPosition="start"
          label="Register Patient"
        />

        <Tab
          icon={<FolderSharedIcon />}
          iconPosition="start"
          label="Patient Directory"
        />
      </Tabs>
    </Box>
  );
}