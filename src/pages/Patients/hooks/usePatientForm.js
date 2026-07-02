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

  bloodGroup: "",
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
  nationality:"",
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

      remarks: editingPatient.remarks || "",
    });
  }, [editingPatient]);

  const handleSubmit = async () => {
    const validationErrors = validatePatient(formData);
console.log("formData" , formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
console.log("formData123" , formData);
      if (editingPatient?.id) {
        await updatePatient(editingPatient.id, formData);
      } else {
        await createPatient(formData);
      }

      refreshPatients();

      resetForm();

      switchToDirectory();
    } catch (error) {
      console.error(error);
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