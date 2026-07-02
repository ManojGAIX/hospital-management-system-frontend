import React, { useMemo, useState } from "react";

import { Box } from "@mui/material";

import PatientSearch from "./PatientSearch";
import PatientTable from "./PatientTable";
import DeletePatientDialog from "./DeletePatientDialog";

export default function PatientDirectory({
  patients = [],
  onEdit,
  onDelete,
  onView,
}) {
  const [filters, setFilters] = useState({
    search: "",
    gender: "",
  });

  const [deletePatient, setDeletePatient] = useState(null);

  const handleClear = () => {
    setFilters({
      search: "",
      gender: "",
    });
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        patient.name?.toLowerCase().includes(search) ||
        patient.phone?.includes(search) ||
        patient.patientCode?.toLowerCase().includes(search) ||
        String(patient.id).includes(search);

      const matchesGender =
        !filters.gender ||
        patient.gender === filters.gender;

      return matchesSearch && matchesGender;
    });
  }, [patients, filters]);

  return (
    <Box>
      <PatientSearch
        filters={filters}
        setFilters={setFilters}
        onClear={handleClear}
      />

      <PatientTable
        patients={filteredPatients}
        onEdit={onEdit}
        onView={onView}
        onDelete={(patient) =>
          setDeletePatient(patient)
        }
      />

      <DeletePatientDialog
        open={Boolean(deletePatient)}
        patient={deletePatient}
        onClose={() => setDeletePatient(null)}
        onConfirm={() => {
          onDelete(deletePatient);
          setDeletePatient(null);
        }}
      />
    </Box>
  );
}