const validatePatient = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) {
    errors.name = "Full Name is required";
  }

  if (formData.name && formData.name.trim().length < 3) {
    errors.name = "Minimum 3 characters required";
  }

  if (!formData.gender) {
    errors.gender = "Gender is required";
  }

  if (!formData.phone) {
    errors.phone = "Phone Number is required";
  } else if (!/^\d{10}$/.test(formData.phone)) {
    errors.phone = "Phone Number must be 10 digits";
  }

  if (!formData.age && !formData.dateOfBirth) {
    errors.age = "Age or Date of Birth is required";
  }

  if (formData.age) {
    const age = Number(formData.age);

    if (age < 0 || age > 120) {
      errors.age = "Age must be between 0 and 120";
    }
  }

  if (
    formData.email &&
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
  ) {
    errors.email = "Invalid Email Address";
  }

  if (
    formData.pincode &&
    !/^\d{6}$/.test(formData.pincode)
  ) {
    errors.pincode = "Pincode must be 6 digits";
  }

  if (
    formData.emergencyContactNumber &&
    !/^\d{10}$/.test(formData.emergencyContactNumber)
  ) {
    errors.emergencyContactNumber =
      "Emergency Contact must be 10 digits";
  }

  if (
    formData.phone &&
    formData.emergencyContactNumber &&
    formData.phone === formData.emergencyContactNumber
  ) {
    errors.emergencyContactNumber =
      "Emergency Contact should be different from Phone Number";
  }

  if (
    formData.dateOfBirth &&
    new Date(formData.dateOfBirth) > new Date()
  ) {
    errors.dateOfBirth = "Future Date is not allowed";
  }

  return errors;
};

export default validatePatient;