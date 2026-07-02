import React from "react";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Box,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function PatientTable({
  patients,
  onEdit,
  onDelete,
  onView,
}) {
      if (!patients.length) {
    return (
      <Paper
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          color="text.secondary"
        >
          No Patients Found
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table>

        <TableHead>

          <TableRow
            sx={{
              background: "#1E40AF",
            }}
          >
            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              Patient ID
            </TableCell>

            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              Name
            </TableCell>

            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              Gender
            </TableCell>

            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              Age
            </TableCell>

            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              Phone
            </TableCell>

            <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
              City
            </TableCell>

            <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
              Actions
            </TableCell>

          </TableRow>

        </TableHead>

        <TableBody>

                      {patients.map((patient) => (
            <TableRow
              hover
              key={patient.id}
            >
              <TableCell>
                {patient.patientCode || patient.id}
              </TableCell>

              <TableCell>
                <Box>
                  <Typography fontWeight={600}>
                    {patient.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {patient.bloodGroup}
                  </Typography>
                </Box>
              </TableCell>

              <TableCell>
                <Chip
                  label={patient.gender}
                  color={
                    patient.gender === "Male"
                      ? "primary"
                      : patient.gender === "Female"
                      ? "secondary"
                      : "default"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                {patient.age}
              </TableCell>

              <TableCell>
                {patient.phone}
              </TableCell>

              <TableCell>
                {patient.city}
              </TableCell>

              <TableCell align="center">

                <Tooltip title="View">

                  <IconButton
                    color="info"
                    onClick={() => onView(patient)}
                  >
                    <VisibilityIcon />
                  </IconButton>

                </Tooltip>

                <Tooltip title="Edit">

                  <IconButton
                    color="primary"
                    onClick={() => onEdit(patient)}
                  >
                    <EditIcon />
                  </IconButton>

                </Tooltip>

                <Tooltip title="Delete">

                  <IconButton
                    color="error"
                    onClick={() => onDelete(patient)}
                  >
                    <DeleteIcon />
                  </IconButton>

                </Tooltip>

              </TableCell>

            </TableRow>
          ))}

        </TableBody>

      </Table>

    </TableContainer>
  );
}