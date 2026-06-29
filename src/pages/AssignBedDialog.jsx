import React, { useState } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, FormControl, InputLabel, Select, MenuItem, TextField, Box 
} from "@mui/material";

export default function AssignBedDialog({ open, handleClose, bed, patients, onAssign }) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    if (!selectedPatientId) return alert("Please select a patient");
    
    const patient = patients.find(p => p.id === selectedPatientId);
    onAssign({
      bedId: bed.id,
      patientId: patient.id,
      patientName: patient.name,
      admissionDate: admissionDate
    });
    
    setSelectedPatientId(""); // Reset for next time
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800, color: "#1e3a8a" }}>
        Assign Patient: {bed?.bedNumber}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Select Patient</InputLabel>
            <Select
              value={selectedPatientId}
              label="Select Patient"
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} (ID: {p.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Admission Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} sx={{ fontWeight: "bold" }}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          sx={{ 
            backgroundColor: "#1e3a8a", 
            fontWeight: "bold",
            borderRadius: 2,
            px: 4
          }}
        >
          Confirm Admission
        </Button>
      </DialogActions>
    </Dialog>
  );
}
