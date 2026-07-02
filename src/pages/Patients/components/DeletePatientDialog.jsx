import React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function DeletePatientDialog({
  open,
  patient,
  loading = false,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
        >
          <WarningAmberRoundedIcon
            color="warning"
            fontSize="large"
          />

          <Typography
            variant="h6"
            fontWeight={700}
          >
            Delete Patient
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this patient?
        </DialogContentText>

        <Typography
          sx={{
            mt: 2,
            fontWeight: 700,
            color: "#1E40AF",
          }}
        >
          {patient?.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {patient?.phone}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          disabled={loading}
          onClick={onConfirm}
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : null
          }
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}