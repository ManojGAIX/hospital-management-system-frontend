import {
  Grid,
  Paper,
  Typography,
  Divider,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import EditIcon from "@mui/icons-material/Edit";

import usePatientForm from "../hooks/usePatientForm";

import {
  genderOptions,
  bloodGroupOptions,
  maritalStatusOptions,
  stateOptions,
  cityOptions,
} from "../utils/constants";

export default function PatientForm({
  refreshPatients,
  switchToDirectory,
  editingPatient,
}) {
  const {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    calculateAge,
    calculateDOB,
    resetForm,
  } = usePatientForm({
    refreshPatients,
    switchToDirectory,
    editingPatient,
  });

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,

        background: "rgba(255,255,255,0.75)",

        backdropFilter: "blur(12px)",

        border: "1px solid rgba(255,255,255,0.4)",

        boxShadow: "0 8px 32px rgba(15,23,42,0.08)",
      }}
    >
      {/* ========================================= */}
      {/* PERSONAL INFORMATION */}
      {/* ========================================= */}

      <Typography
        variant="h6"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#2563EB",
          fontWeight: 700,
        }}
      >
        <PersonIcon />
        Personal Information
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {/* Patient Name */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Patient Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        {/* DOB */}

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ""}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            onChange={(e) => {
              const dob = e.target.value;

              handleChange("dateOfBirth", dob);
              handleChange("age", calculateAge(dob));
            }}
          />
        </Grid>

        {/* Age */}

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formData.age || ""}
            onChange={(e) => {
              const age = e.target.value;

              handleChange("age", age);
              handleChange("dateOfBirth", calculateDOB(age));
            }}
          />
        </Grid>

        {/* Gender */}

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            error={!!errors.gender}
            helperText={errors.gender}
          >
            {genderOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Blood Group */}

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            fullWidth
            select
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={(e) => handleChange("bloodGroup", e.target.value)}
          >
            {bloodGroupOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      {/* Marital Status */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            select
            label="Marital Status"
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={(e) => handleChange("maritalStatus", e.target.value)}
          >
            {maritalStatusOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Occupation */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Occupation (Optional)"
            name="occupation"
            value={formData.occupation}
            onChange={(e) => handleChange("occupation", e.target.value)}
          />
        </Grid>

        {/* Nationality */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Nationality"
            name="nationality"
            value={formData.nationality}
            onChange={(e) => handleChange("nationality", e.target.value)}
          />
        </Grid>
      </Grid>

      {/* ========================================= */}
      {/* CONTACT INFORMATION */}
      {/* ========================================= */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#2563EB",
          fontWeight: 700,
        }}
      >
        <ContactPhoneIcon />
        Contact Information
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {/* Phone */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");

              if (value.length > 10) return;

              handleChange("phone", value);
            }}
            error={!!errors.phone}
            helperText={errors.phone}
          />
        </Grid>

        {/* Email */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Email Address (Optional)"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={!!errors.email}
            helperText={errors.email || "Leave blank if not available"}
          />
        </Grid>

        {/* Pincode */}

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            label="Pincode"
            name="pincode"
            value={formData.pincode}
            onChange={(e) => handleChange("pincode", e.target.value)}
            error={!!errors.pincode}
            helperText={errors.pincode}
          />
        </Grid>
      </Grid>

      {/* Address */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </Grid>

        {/* State */}

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="State"
            name="state"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
          >
            {stateOptions.map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* City */}

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          >
            {cityOptions.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Emergency Contact Name */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={(e) =>
              handleChange("emergencyContactName", e.target.value)
            }
          />
        </Grid>

        {/* Emergency Contact Number */}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Emergency Contact Number"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");

              if (value.length > 10) return;

              handleChange("emergencyContactNumber", value);
            }}
            error={!!errors.emergencyContactNumber}
            helperText={errors.emergencyContactNumber}
          />
        </Grid>
      </Grid>

      {/* ========================================= */}
      {/* ADDITIONAL INFORMATION */}
      {/* ========================================= */}

      <Typography
        variant="h6"
        sx={{
          mt: 5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#2563EB",
          fontWeight: 700,
        }}
      >
        <MedicalInformationIcon />
        Additional Information
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        {/* Allergies */}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Allergies (Optional)"
            name="allergies"
            value={formData.allergies}
            onChange={(e) => handleChange("allergies", e.target.value)}
          />
        </Grid>

        {/* Chronic Diseases */}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Chronic Diseases (Optional)"
            name="chronicDiseases"
            value={formData.chronicDiseases}
            onChange={(e) => handleChange("chronicDiseases", e.target.value)}
          />
        </Grid>

        {/* Remarks */}

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Remarks (Optional)"
            name="remarks"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
          />
        </Grid>
      </Grid>

      {/* ========================================= */}
      {/* ACTION BUTTONS */}
      {/* ========================================= */}

      <Divider sx={{ my: 4 }} />

      <Grid container justifyContent="flex-end" spacing={2}>
        <Grid item>
          <Button
            variant="outlined"
            color="inherit"
            onClick={resetForm}
            disabled={loading}
            sx={{
              minWidth: 140,
              height: 50,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={
              loading ? null : editingPatient ? (
                <EditIcon />
              ) : (
                <PersonAddAlt1Icon />
              )
            }
            sx={{
              minWidth: 220,
              height: 50,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.3px",
              background: "linear-gradient(135deg,#06B6D4,#1E40AF)",
              color: "#fff",
              boxShadow: "0 8px 20px rgba(6,182,212,0.25)",
              transition: "all 0.3s ease",

              "&:hover": {
                background: "linear-gradient(135deg,#0891B2,#1D4ED8)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(6,182,212,0.35)",
              },
              "&:active": {
                transform: "scale(0.98)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : editingPatient ? (
              "Update Patient"
            ) : (
              "Register Patient"
            )}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
