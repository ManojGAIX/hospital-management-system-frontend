export const calculateAge = (dob) => {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : "";
};

export const calculateDOB = (age) => {
  if (age === "" || age == null) return "";

  const years = parseInt(age, 10);

  if (isNaN(years) || years < 0) return "";

  const today = new Date();

  const dob = new Date(
    today.getFullYear() - years,
    today.getMonth(),
    today.getDate()
  );

  return dob.toISOString().split("T")[0];
};

export const formatPhoneNumber = (phone = "") => {
  return phone.replace(/\D/g, "").slice(0, 10);
};

export const formatPincode = (pincode = "") => {
  return pincode.replace(/\D/g, "").slice(0, 6);
};

export const capitalizeWords = (text = "") => {
  return text
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const generatePatientCode = () => {
  const now = new Date();

  const yyyy = now.getFullYear();

  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const dd = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAT-${yyyy}${mm}${dd}-${random}`;
};

export const getGenderCount = (patients = [], gender) => {
  return patients.filter(
    (patient) =>
      patient.gender?.toLowerCase() ===
      gender.toLowerCase()
  ).length;
};

export const getTodayRegistrations = (patients = []) => {
  const today = new Date().toISOString().split("T")[0];

  return patients.filter((patient) => {
    if (!patient.createdAt) return false;

    return patient.createdAt.substring(0, 10) === today;
  }).length;
};