import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import EditIcon from "@mui/icons-material/Edit";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import usePatientForm from "../hooks/usePatientForm";

import {
  bloodGroupOptions,
  cityOptions,
  genderOptions,
  maritalStatusOptions,
  stateOptions,
} from "../utils/constants";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  "& .MuiInputLabel-root": {
    fontWeight: 650,
  },
};

const sectionTitleSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  color: "#1E40AF",
  fontWeight: 900,
  letterSpacing: 0,
};

function SectionHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" sx={sectionTitleSx}>
        {icon}
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 650, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
      <Divider sx={{ mt: 1.5 }} />
    </Box>
  );
}

export default function PatientForm({ refreshPatients, switchToDirectory, editingPatient }) {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    calculateAge,
    calculateDOB,
    resetForm,
  } = usePatientForm({ refreshPatients, switchToDirectory, editingPatient });

  const handleSaveAndBook = async () => {
    const savedPatient = await handleSubmit({ skipDirectory: true });
    if (savedPatient) {
      navigate("/appointments", { state: { patient: savedPatient.data || savedPatient } });
    }
  };

  const handleDigits = (field, value, maxLength) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= maxLength) handleChange(field, digits);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid #dbe4ee",
        background: "#fff",
        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2.25,
          borderBottom: "1px solid #dbe4ee",
          background: "linear-gradient(135deg,#f8fbff 0%,#eef6ff 100%)",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                background: "linear-gradient(135deg,#1E40AF,#06B6D4)",
              }}
            >
              {editingPatient ? <EditIcon /> : <PersonAddAlt1Icon />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950, color: "#0f172a", letterSpacing: 0 }}>
                {editingPatient ? "Update Patient" : "Register Patient"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 700 }}>
                Capture demographic, contact and clinical reference details
              </Typography>
            </Box>
          </Stack>
          {editingPatient?.patientId && (
            <Typography sx={{ color: "#1E40AF", fontWeight: 900 }}>
              {editingPatient.patientId}
            </Typography>
          )}
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <SectionHeader icon={<PersonIcon />} title="Personal Information" subtitle="Identity, age and demographic details" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth required size="small" label="Patient Name" name="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} error={!!errors.name} helperText={errors.name} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} slotProps={{ inputLabel: { shrink: true } }} onChange={(e) => { const dob = e.target.value; handleChange("dateOfBirth", dob); handleChange("age", calculateAge(dob)); }} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth required size="small" label="Age" name="age" type="number" value={formData.age || ""} onChange={(e) => { const age = e.target.value; if (Number(age) < 0 || Number(age) > 125) return; handleChange("age", age); handleChange("dateOfBirth", calculateDOB(age)); }} error={!!errors.age} helperText={errors.age} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth required select size="small" label="Gender" name="gender" value={formData.gender} onChange={(e) => handleChange("gender", e.target.value)} error={!!errors.gender} helperText={errors.gender} sx={fieldSx}>{genderOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={(e) => handleChange("bloodGroup", e.target.value)} sx={fieldSx}>{bloodGroupOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth select size="small" label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={(e) => handleChange("maritalStatus", e.target.value)} sx={fieldSx}>{maritalStatusOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Occupation" name="occupation" value={formData.occupation} onChange={(e) => handleChange("occupation", e.target.value)} sx={fieldSx} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" label="Nationality" name="nationality" value={formData.nationality} onChange={(e) => handleChange("nationality", e.target.value)} sx={fieldSx} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <SectionHeader icon={<ContactPhoneIcon />} title="Contact Information" subtitle="Phone, address and emergency contact" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth required size="small" label="Phone Number" name="phone" value={formData.phone} onChange={(e) => handleDigits("phone", e.target.value, 10)} error={!!errors.phone} helperText={errors.phone} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth size="small" label="Email Address" name="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} error={!!errors.email} helperText={errors.email || "Optional"} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth size="small" label="Pincode" name="pincode" value={formData.pincode} onChange={(e) => handleDigits("pincode", e.target.value, 6)} error={!!errors.pincode} helperText={errors.pincode} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth multiline rows={3} size="small" label="Address" name="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth select size="small" label="State" name="state" value={formData.state} onChange={(e) => handleChange("state", e.target.value)} sx={fieldSx}>{stateOptions.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}</TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField fullWidth select size="small" label="City" name="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} sx={fieldSx}>{cityOptions.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}</TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={(e) => handleChange("emergencyContactName", e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth size="small" label="Emergency Contact Number" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={(e) => handleDigits("emergencyContactNumber", e.target.value, 10)} error={!!errors.emergencyContactNumber} helperText={errors.emergencyContactNumber} sx={fieldSx} />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          <SectionHeader icon={<MedicalInformationIcon />} title="Medical Notes" subtitle="Known risks, chronic conditions and registration remarks" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth multiline rows={3} size="small" label="Allergies" name="allergies" value={formData.allergies} onChange={(e) => handleChange("allergies", e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth multiline rows={3} size="small" label="Chronic Diseases" name="chronicDiseases" value={formData.chronicDiseases} onChange={(e) => handleChange("chronicDiseases", e.target.value)} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth multiline rows={3} size="small" label="Remarks" name="remarks" value={formData.remarks} onChange={(e) => handleChange("remarks", e.target.value)} sx={fieldSx} />
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2, borderTop: "1px solid #dbe4ee", backgroundColor: "#f8fafc" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={resetForm} disabled={loading} startIcon={<RestartAltIcon />} sx={{ minWidth: 140, height: 42, borderRadius: 2, textTransform: "none", fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading} startIcon={loading ? null : editingPatient ? <EditIcon /> : <PersonAddAlt1Icon />} sx={{ minWidth: 210, height: 42, borderRadius: 2, textTransform: "none", fontWeight: 900, background: "linear-gradient(135deg,#06B6D4,#1E40AF)", color: "#fff", boxShadow: "0 8px 20px rgba(6,182,212,0.25)" }}>
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : editingPatient ? "Update Patient" : "Register Patient"}
          </Button>
          <Button variant="outlined" startIcon={<LocalHospitalIcon />} onClick={handleSaveAndBook} disabled={loading} sx={{ minWidth: 210, height: 42, borderRadius: 2, textTransform: "none", fontWeight: 900, borderColor: "#93c5fd", color: "#1E40AF" }}>
            Save & Book Appointment
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}


