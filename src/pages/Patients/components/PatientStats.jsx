import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

import Groups2Icon from "@mui/icons-material/Groups2";
import ManIcon from "@mui/icons-material/Man";
import Woman2Icon from "@mui/icons-material/Woman2";
import TodayIcon from "@mui/icons-material/Today";

export default function PatientStats({ patients = [] }) {
  const totalPatients = patients.length;

  const malePatients = patients.filter(
    (p) => p.gender?.toLowerCase() === "male",
  ).length;

  const femalePatients = patients.filter(
    (p) => p.gender?.toLowerCase() === "female",
  ).length;

  const today = new Date().toISOString().split("T")[0];

  const todayRegistrations = patients.filter((p) => {
    if (!p.createdAt) return false;
    return p.createdAt.startsWith(today);
  }).length;

  const cards = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: <Groups2Icon sx={{ fontSize: 24 }} />,
      gradient: "linear-gradient(135deg,#2563EB,#1D4ED8)",
    },
    {
      title: "Male Patients",
      value: malePatients,
      icon: <ManIcon sx={{ fontSize: 24 }} />,
      gradient: "linear-gradient(135deg,#0891B2,#06B6D4)",
    },
    {
      title: "Female Patients",
      value: femalePatients,
      icon: <Woman2Icon sx={{ fontSize: 24 }} />,
      gradient: "linear-gradient(135deg,#DB2777,#EC4899)",
    },
    {
      title: "Today's Registration",
      value: todayRegistrations,
      icon: <TodayIcon sx={{ fontSize: 24 }} />,
      gradient: "linear-gradient(135deg,#059669,#10B981)",
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: "14px",
              color: "#fff",
              background: card.gradient,
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(4px)",
              }}
            >
              {card.icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  opacity: 0.85,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  letterSpacing: "0.2px",
                  lineHeight: 1.2,
                }}
                noWrap
              >
                {card.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mt: 0.2,
                }}
              >
                {card.value}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
