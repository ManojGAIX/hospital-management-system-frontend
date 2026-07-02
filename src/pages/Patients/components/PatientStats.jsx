import React from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";

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
      icon: <Groups2Icon sx={{ fontSize: 42 }} />,
      gradient: "linear-gradient(135deg,#2563EB,#1D4ED8)",
    },
    {
      title: "Male Patients",
      value: malePatients,
      icon: <ManIcon sx={{ fontSize: 42 }} />,
      gradient: "linear-gradient(135deg,#0891B2,#06B6D4)",
    },
    {
      title: "Female Patients",
      value: femalePatients,
      icon: <Woman2Icon sx={{ fontSize: 42 }} />,
      gradient: "linear-gradient(135deg,#DB2777,#EC4899)",
    },
    {
      title: "Today's Registration",
      value: todayRegistrations,
      icon: <TodayIcon sx={{ fontSize: 42 }} />,
      gradient: "linear-gradient(135deg,#059669,#10B981)",
    },
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <Card
            sx={{
              borderRadius: 4,
              color: "#fff",
              background: card.gradient,
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              transition: "0.3s",

              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: 120,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    opacity: 0.9,
                    fontSize: 15,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography variant="h3" fontWeight="bold">
                  {card.value}
                </Typography>
              </Box>

              {card.icon}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
