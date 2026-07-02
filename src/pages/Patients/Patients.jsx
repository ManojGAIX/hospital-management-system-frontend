import { useEffect, useState } from "react";
import { Box, Container, CircularProgress } from "@mui/material";

import PatientTabs from "./components/PatientTabs";
import PatientStats from "./components/PatientStats";
import PatientForm from "./components/PatientForm";
import PatientDirectory from "./components/PatientDirectory";

import {
  getPatients,
  deletePatient,
} from "../../services/patientService";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  // 0 = Register Patient
  // 1 = Patient Directory
  const [tab, setTab] = useState(0);

  const [editingPatient, setEditingPatient] = useState(null);

  // -----------------------------
  // Load Patients
  // -----------------------------
  const loadPatients = async () => {
    try {
      setLoading(true);

      const response = await getPatients();

      setPatients(response.data.data || []);
    } catch (error) {
      console.error("Error loading patients", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // -----------------------------
  // Edit Patient
  // -----------------------------
  const handleEdit = (patient) => {
    setEditingPatient(patient);

    // Switch to Register Tab
    setTab(0);
  };

  // -----------------------------
  // Delete Patient
  // -----------------------------
  const handleDelete = async (patient) => {
    try {
      await deletePatient(patient.id);

      loadPatients();
    } catch (error) {
      console.error("Delete Failed", error);
    }
  };

  // -----------------------------
  // View Patient
  // -----------------------------
  const handleView = (patient) => {
    console.log(patient);

    // Future:
    // Open Patient Details Dialog
  };

  // -----------------------------
  // After Save/Update
  // -----------------------------
  const switchToDirectory = () => {
    setEditingPatient(null);

    setTab(1);

    loadPatients();
  };

  return (
    <Box
      sx={{
        py: 3,
        width: "100%",
      }}
    >
      {/* =========================
            Patient Statistics
      ========================== */}
      <PatientStats patients={patients} />

      {/* =========================
            Tabs
      ========================== */}
      <Box mt={3}>
        <PatientTabs
          value={tab}
          onChange={setTab}
        />
      </Box>

      {/* =========================
            Loading
      ========================== */}
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          py={8}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box mt={3}>
          {/* =========================
                Register Patient
          ========================== */}
          {tab === 0 && (
            <PatientForm
              editingPatient={editingPatient}
              refreshPatients={loadPatients}
              switchToDirectory={switchToDirectory}
            />
          )}

          {/* =========================
                Patient Directory
          ========================== */}
          {tab === 1 && (
            <PatientDirectory
              patients={patients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          )}
        </Box>
      )}
    </Box>
  );
}