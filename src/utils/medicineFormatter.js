const DOSAGE_MAPPINGS = {
  "TABLET": "TAB",
  "TABLETS": "TAB",
  "TAB": "TAB",
  
  "SYRUP": "SYP",
  "SYRUPS": "SYP",
  "SYP": "SYP",
  
  "INJECTION": "INJ",
  "INJECTIONS": "INJ",
  "INJ": "INJ",
  
  "CAPSULE": "CAP",
  "CAPSULES": "CAP",
  "CAP": "CAP",
  
  "OINTMENT": "OINT",
  "OINTMENTS": "OINT",
  "OINT": "OINT",
  
  "SUSPENSION": "SUSP",
  "SUSP": "SUSP",
  
  "POWDER": "PWD",
  "POWDERS": "PWD",
  "PWD": "PWD",
  
  "CREAM": "CRM",
  "CREAMS": "CRM",
  "CRM": "CRM",
  
  "GEL": "GEL",
  "GELS": "GEL",
  
  "DROPS": "DRP",
  "DROP": "DRP",
  "DRP": "DRP",
  
  "INHALER": "INH",
  "INHALERS": "INH",
  "INH": "INH",
  
  "SOLUTION": "SOLN",
  "SOLUTIONS": "SOLN",
  "SOLN": "SOLN",
  
  "SPRAY": "SPR",
  "SPRAYS": "SPR",
  "SPR": "SPR",
  
  "LOTION": "LOT",
  "LOTIONS": "LOT",
  "LOT": "LOT",
  
  "INFUSION": "INF",
  "INFUSIONS": "INF",
  "INF": "INF"
};

export const getDosageAbbreviation = (dosageType = "") => {
  const type = String(dosageType).trim().toUpperCase();
  return DOSAGE_MAPPINGS[type] || type;
};

export const getMedicineLabel = (medicine = {}) => {
  if (!medicine) return "";
  const dosageType = String(medicine.dosageType || "").trim();
  const name = String(medicine.medicineName || "").trim();
  const abbr = getDosageAbbreviation(dosageType);

  const label = [abbr, name].filter(Boolean).join(" ");
  return label || name || "";
};

export const formatMedicineLabel = (medicineName = "", dosageType = "") => {
  const type = String(dosageType).trim();
  const name = String(medicineName).trim();
  const abbr = getDosageAbbreviation(type);
  return [abbr, name].filter(Boolean).join(" ");
};
