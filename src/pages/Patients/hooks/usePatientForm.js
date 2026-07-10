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

      const response = editingPatient?.id
        ? await updatePatient(editingPatient.id, formData)
        : await createPatient(formData);

      refreshPatients();

      resetForm();

      if (!options.skipDirectory) {
        switchToDirectory();
      }

      return response.data;
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to save patient";
      alert("Error: " + errorMsg);
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

