// src/pages/ProcedureBillView.jsx

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export default function ProcedureBillView() {
  const { id } = useParams();

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Procedure Bill Details
        </Typography>

        <Typography mt={2}>
          Bill ID: {id}
        </Typography>
      </Paper>
    </Box>
  );
}