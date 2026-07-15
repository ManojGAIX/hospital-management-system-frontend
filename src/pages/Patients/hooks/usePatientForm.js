import { useEffect, useState } from "react";

import {
  createPatient,
  updatePatient,
} from "../../../services/patientService";

import {
  calculateAge,
  calculateDOB,
} from "../utils/patientHelpers";

import validatePatient from "../utils/patientValidation";

const initialFormData = {
  name: "",
  gender: "",
  age: "",
  dateOfBirth: "",

  bloodGroup: "Unknown",
  maritalStatus: "",

  phone: "",
  email: "",

  emergencyContactName: "",
  emergencyContactNumber: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  occupation: "",

  remarks: "",
  nationality:"Indian",
  allergies:"",
  chronicDiseases:"",
};

export default function usePatientForm({
  refreshPatients,
  switchToDirectory,
  editingPatient,
}) {
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [field]: "",
  }));
};

  const resetForm = () => {
  setErrors({});

  setFormData(initialFormData);

  if (editingPatient) {
    switchToDirectory();
  }
};



    useEffect(() => {
    if (!editingPatient) return;

    setFormData({
      name: editingPatient.name || "",
      gender: editingPatient.gender || "",
      age: editingPatient.age || "",
      dateOfBirth: editingPatient.dateOfBirth || "",

      bloodGroup: editingPatient.bloodGroup || "",
      maritalStatus: editingPatient.maritalStatus || "",

      phone: editingPatient.phone || "",
      email: editingPatient.email || "",

      emergencyContactName:
        editingPatient.emergencyContactName || "",

      emergencyContactNumber:
        editingPatient.emergencyContactNumber || "",

      address: editingPatient.address || "",

      city: editingPatient.city || "",

      state: editingPatient.state || "",

      pincode: editingPatient.pincode || "",

      occupation: editingPatient.occupation || "",
      nationality: editingPatient.nationality || "Indian",
      allergies: editingPatient.allergies || "",
      chronicDiseases: editingPatient.chronicDiseases || "",
      remarks: editingPatient.remarks || "",
    });
  }, [editingPatient]);

  const handleSubmit = async (options = {}) => {
    const validationErrors = validatePatient(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return null;
    }

    try {
      setLoading(true);

      // Strip empty-string values so optional fields are sent as absent/null
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== "")
      );

      const response = editingPatient?.id
        ? await updatePatient(editingPatient.id, payload)
        : await createPatient(payload);

      refreshPatients();

      resetForm();

      if (!options.skipDirectory) {
        switchToDirectory();
      }

      return response.data;
    } catch (error) {
      console.error(error);

      const resp = error.response?.data;

      // Attempt to map backend validation errors to individual form fields
      const fieldErrors = {};

      // Common Spring-style validation payloads: array of errors
      if (Array.isArray(resp?.errors) && resp.errors.length) {
        resp.errors.forEach((e) => {
          const field = e.field || e.name || e.property || e.param;
          const msg = e.defaultMessage || e.message || String(e);
          if (field) fieldErrors[field] = msg;
        });
      }

      // Some APIs use 'fieldErrors'
      else if (Array.isArray(resp?.fieldErrors) && resp.fieldErrors.length) {
        resp.fieldErrors.forEach((e) => {
          const field = e.field || e.name || e.property;
          const msg = e.defaultMessage || e.message || String(e);
          if (field) fieldErrors[field] = msg;
        });
      }

      // Fallback: try to extract "field 'name' ... default message [Message]" patterns
      else if (typeof resp?.message === "string") {
        const regex = /field '([a-zA-Z0-9_]+)'[\s\S]*?default message \[([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(resp.message)) !== null) {
          fieldErrors[match[1]] = match[2];
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      } else {
        const errorMsg = resp?.message || error.message || "Failed to save patient";
        alert("Error: " + errorMsg);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };
    return {
    formData,
    errors,
    loading,

    handleChange,

    calculateAge,

    calculateDOB,

    handleSubmit,

    resetForm,
  };
}

