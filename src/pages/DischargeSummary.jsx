import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  IconButton,
  Divider,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import api from "../services/api";

export default function DischargeSummary() {
  // Navigation / View State
  const [view, setView] = useState("list"); // "list" | "form"
  const [summaries, setSummaries] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [ageSex, setAgeSex] = useState("");
  const [prnIpNo, setPrnIpNo] = useState("");
  const [address, setAddress] = useState("");
  const [consultant, setConsultant] = useState("");
  const [dateOfAdmission, setDateOfAdmission] = useState("");
  const [dateOfDischarge, setDateOfDischarge] = useState("");

  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [procedurePerformed, setProcedurePerformed] = useState("");
  const [presentingComplaints, setPresentingComplaints] = useState("");
  const [historyPresentIllness, setHistoryPresentIllness] = useState("");

  // Vitals
  const [pulse, setPulse] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [temperature, setTemperature] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [localSystemicExam, setLocalSystemicExam] = useState("");

  // Past History
  const [diabetesMellitus, setDiabetesMellitus] = useState("No");
  const [hypertension, setHypertension] = useState("No");
  const [previousSurgery, setPreviousSurgery] = useState("None");
  const [drugAllergy, setDrugAllergy] = useState("None");
  const [otherSignificantHistory, setOtherSignificantHistory] = useState("None");

  // Investigations
  const [investigationCbc, setInvestigationCbc] = useState("");
  const [investigationEsr, setInvestigationEsr] = useState("");
  const [investigationCrp, setInvestigationCrp] = useState("");
  const [investigationRft, setInvestigationRft] = useState("");
  const [investigationLft, setInvestigationLft] = useState("");
  const [investigationBloodSugar, setInvestigationBloodSugar] = useState("");
  const [investigationImaging, setInvestigationImaging] = useState("");
  const [investigationOther, setInvestigationOther] = useState("");

  // Hospital Course & Treatment
  const [hospitalCourse, setHospitalCourse] = useState("");
  const [medicationsDuringStay, setMedicationsDuringStay] = useState("");

  // Condition at Discharge
  const [consciousAndOriented, setConsciousAndOriented] = useState(true);
  const [afebrile, setAfebrile] = useState(true);
  const [hemodynamicallyStable, setHemodynamicallyStable] = useState(true);
  const [woundHealthy, setWoundHealthy] = useState(true);
  const [ambulatingAsTolerated, setAmbulatingAsTolerated] = useState(true);

  // Medications & Advice
  const [dischargeMedicationsList, setDischargeMedicationsList] = useState([""]);
  const [dischargeAdvice, setDischargeAdvice] = useState(
    "Take medicines as prescribed.\nKeep the wound clean and dry.\nRegular dressing if advised.\nFollow diabetic/hypertensive medications if applicable.\nReview immediately if fever, increased pain, swelling, redness, bleeding, or discharge develops."
  );
  const [followUp, setFollowUp] = useState("Review after __ days or earlier if required.");

  useEffect(() => {
    loadSummaries();
    loadPatients();
    loadDoctors();
  }, []);

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/discharge-summaries");
      setSummaries(res.data || []);
    } catch (err) {
      console.error("Error loading discharge summaries:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await api.get("/api/patients");
      setPatients(res.data?.data || []);
    } catch (err) {
      console.error("Error loading patients:", err);
    }
  };

  const loadDoctors = async () => {
    try {
      const res = await api.get("/api/doctors");
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const handlePatientSelect = async (event, patientObj) => {
    setSelectedPatient(patientObj);
    if (!patientObj) {
      setPatientName("");
      setAgeSex("");
      setPrnIpNo("");
      setAddress("");
      return;
    }

    setPatientName(patientObj.name || "");
    const sexChar = patientObj.gender ? patientObj.gender.charAt(0).toUpperCase() : "";
    setAgeSex(`${patientObj.age || ""}/${sexChar}`);
    setPrnIpNo(patientObj.patientCode || "");
    setAddress(patientObj.address || "");

    // Pre-fill admission dates from patient profile
    try {
      const res = await api.get(`/api/patientprofile/${patientObj.id}`);
      const profile = res.data;
      if (profile && profile.bedAssignments && profile.bedAssignments.length > 0) {
        const latestAssign = profile.bedAssignments[0];
        if (latestAssign.admissionDate) {
          setDateOfAdmission(latestAssign.admissionDate);
        }
        if (latestAssign.dischargeDate) {
          setDateOfDischarge(latestAssign.dischargeDate);
        } else {
          setDateOfDischarge(new Date().toISOString().split("T")[0]);
        }
      }
      if (profile && profile.visits && profile.visits.length > 0) {
        const latestVisit = profile.visits[0];
        if (latestVisit.doctorName) {
          setConsultant(latestVisit.doctorName);
        }
      }
    } catch (err) {
      console.error("Failed to load patient profile details:", err);
    }
  };

  const handleAddMedication = () => {
    setDischargeMedicationsList([...dischargeMedicationsList, ""]);
  };

  const handleMedicationChange = (index, value) => {
    const newList = [...dischargeMedicationsList];
    newList[index] = value;
    setDischargeMedicationsList(newList);
  };

  const handleRemoveMedication = (index) => {
    const newList = dischargeMedicationsList.filter((_, i) => i !== index);
    setDischargeMedicationsList(newList.length ? newList : [""]);
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedPatient(null);
    setPatientName("");
    setAgeSex("");
    setPrnIpNo("");
    setAddress("");
    setConsultant("");
    setDateOfAdmission("");
    setDateOfDischarge("");
    setFinalDiagnosis("");
    setProcedurePerformed("");
    setPresentingComplaints("");
    setHistoryPresentIllness("");
    setPulse("");
    setBloodPressure("");
    setTemperature("");
    setRespiratoryRate("");
    setSpo2("");
    setLocalSystemicExam("");
    setDiabetesMellitus("No");
    setHypertension("No");
    setPreviousSurgery("None");
    setDrugAllergy("None");
    setOtherSignificantHistory("None");
    setInvestigationCbc("");
    setInvestigationEsr("");
    setInvestigationCrp("");
    setInvestigationRft("");
    setInvestigationLft("");
    setInvestigationBloodSugar("");
    setInvestigationImaging("");
    setInvestigationOther("");
    setHospitalCourse("");
    setMedicationsDuringStay("");
    setConsciousAndOriented(true);
    setAfebrile(true);
    setHemodynamicallyStable(true);
    setWoundHealthy(true);
    setAmbulatingAsTolerated(true);
    setDischargeMedicationsList([""]);
    setDischargeAdvice(
      "Take medicines as prescribed.\nKeep the wound clean and dry.\nRegular dressing if advised.\nFollow diabetic/hypertensive medications if applicable.\nReview immediately if fever, increased pain, swelling, redness, bleeding, or discharge develops."
    );
    setFollowUp("Review after __ days or earlier if required.");
  };

  const handleEdit = (summary) => {
    setEditingId(summary.id);
    const patObj = patients.find((p) => p.id === summary.patientId) || null;
    setSelectedPatient(patObj);
    setPatientName(summary.patientName || "");
    setAgeSex(summary.ageSex || "");
    setPrnIpNo(summary.prnIpNo || "");
    setAddress(summary.address || "");
    setConsultant(summary.consultant || "");
    setDateOfAdmission(summary.dateOfAdmission || "");
    setDateOfDischarge(summary.dateOfDischarge || "");
    setFinalDiagnosis(summary.finalDiagnosis || "");
    setProcedurePerformed(summary.procedurePerformed || "");
    setPresentingComplaints(summary.presentingComplaints || "");
    setHistoryPresentIllness(summary.historyPresentIllness || "");
    setPulse(summary.pulse || "");
    setBloodPressure(summary.bloodPressure || "");
    setTemperature(summary.temperature || "");
    setRespiratoryRate(summary.respiratoryRate || "");
    setSpo2(summary.spo2 || "");
    setLocalSystemicExam(summary.localSystemicExam || "");
    setDiabetesMellitus(summary.diabetesMellitus || "No");
    setHypertension(summary.hypertension || "No");
    setPreviousSurgery(summary.previousSurgery || "None");
    setDrugAllergy(summary.drugAllergy || "None");
    setOtherSignificantHistory(summary.otherSignificantHistory || "None");
    setInvestigationCbc(summary.investigationCbc || "");
    setInvestigationEsr(summary.investigationEsr || "");
    setInvestigationCrp(summary.investigationCrp || "");
    setInvestigationRft(summary.investigationRft || "");
    setInvestigationLft(summary.investigationLft || "");
    setInvestigationBloodSugar(summary.investigationBloodSugar || "");
    setInvestigationImaging(summary.investigationImaging || "");
    setInvestigationOther(summary.investigationOther || "");
    setHospitalCourse(summary.hospitalCourse || "");
    setMedicationsDuringStay(summary.medicationsDuringStay || "");
    setConsciousAndOriented(summary.consciousAndOriented);
    setAfebrile(summary.afebrile);
    setHemodynamicallyStable(summary.hemodynamicallyStable);
    setWoundHealthy(summary.woundHealthy);
    setAmbulatingAsTolerated(summary.ambulatingAsTolerated);

    if (summary.dischargeMedications) {
      setDischargeMedicationsList(summary.dischargeMedications.split("\n"));
    } else {
      setDischargeMedicationsList([""]);
    }
    setDischargeAdvice(summary.dischargeAdvice || "");
    setFollowUp(summary.followUp || "");
    setView("form");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this discharge summary?")) {
      try {
        await api.delete(`/api/discharge-summaries/${id}`);
        alert("Discharge summary deleted successfully.");
        loadSummaries();
      } catch (err) {
        console.error("Error deleting discharge summary:", err);
        alert("Failed to delete discharge summary.");
      }
    }
  };

  const handleSave = async () => {
    if (!patientName) {
      alert("Patient Name is required!");
      return;
    }

    const payload = {
      patientId: selectedPatient?.id || null,
      patientName,
      ageSex,
      prnIpNo,
      address,
      consultant,
      dateOfAdmission: dateOfAdmission || null,
      dateOfDischarge: dateOfDischarge || null,
      finalDiagnosis,
      procedurePerformed,
      presentingComplaints,
      historyPresentIllness,
      pulse,
      bloodPressure,
      temperature,
      respiratoryRate,
      spo2,
      localSystemicExam,
      diabetesMellitus,
      hypertension,
      previousSurgery,
      drugAllergy,
      otherSignificantHistory,
      investigationCbc,
      investigationEsr,
      investigationCrp,
      investigationRft,
      investigationLft,
      investigationBloodSugar,
      investigationImaging,
      investigationOther,
      hospitalCourse,
      medicationsDuringStay,
      consciousAndOriented,
      afebrile,
      hemodynamicallyStable,
      woundHealthy,
      ambulatingAsTolerated,
      dischargeMedications: dischargeMedicationsList.filter(m => m.trim()).join("\n"),
      dischargeAdvice,
      followUp,
    };

    try {
      if (editingId) {
        await api.put(`/api/discharge-summaries/${editingId}`, payload);
        alert("Discharge summary updated successfully.");
      } else {
        await api.post("/api/discharge-summaries", payload);
        alert("Discharge summary created successfully.");
      }
      resetForm();
      setView("list");
      loadSummaries();
    } catch (err) {
      console.error("Error saving discharge summary:", err);
      alert("Failed to save discharge summary.");
    }
  };

  const handlePrint = (summary) => {
    const printWindow = window.open("", "_blank");

    const medListItems = (summary.dischargeMedications || "")
      .split("\n")
      .filter((m) => m.trim())
      .map((m) => `<li>${m}</li>`)
      .join("");

    const adviceListItems = (summary.dischargeAdvice || "")
      .split("\n")
      .filter((a) => a.trim())
      .map((a) => `<li>${a}</li>`)
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Discharge Summary - ${summary.patientName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.6;
              font-size: 14px;
              background-color: #fff;
            }
            .header-card {
              text-align: center;
              margin-bottom: 25px;
              border-bottom: 3px double #002366;
              padding-bottom: 15px;
            }
            .header-card h1 {
              font-size: 26px;
              margin: 0;
              font-weight: 800;
              color: #002366;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-card p.subtitle {
              margin: 5px 0;
              font-size: 13px;
              font-weight: 500;
              color: #64748b;
            }
            .header-card p.contact {
              margin: 3px 0;
              font-size: 13px;
              font-weight: 600;
              color: #0f172a;
            }
            .document-title {
              text-align: center;
              font-size: 18px;
              font-weight: 700;
              color: #002366;
              letter-spacing: 2px;
              margin-top: 15px;
              margin-bottom: 25px;
              text-transform: uppercase;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
            }
            .info-table td {
              padding: 10px 12px;
              border: 1px solid #e2e8f0;
              vertical-align: top;
              color: #334155;
            }
            .info-table td.label {
              font-weight: 700;
              width: 18%;
              color: #0f172a;
              background-color: #f1f5f9;
            }
            .info-table td.value {
              width: 32%;
            }
            .section {
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: 700;
              font-size: 14px;
              color: #002366;
              border-bottom: 1.5px solid #cbd5e1;
              padding-bottom: 4px;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .section-content {
              padding-left: 5px;
              white-space: pre-line;
              color: #334155;
            }
            .vitals-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 12px;
              margin-top: 8px;
              margin-bottom: 15px;
            }
            .vital-card {
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 8px;
              text-align: center;
              background-color: #f8fafc;
            }
            .vital-label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
            }
            .vital-value {
              font-size: 15px;
              font-weight: 600;
              color: #0f172a;
              margin-top: 4px;
            }
            ul.styled-list, ol.styled-list {
              margin: 0;
              padding-left: 20px;
              color: #334155;
            }
            ul.styled-list li, ol.styled-list li {
              margin-bottom: 6px;
            }
            .footer-signatures {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 220px;
              text-align: center;
            }
            .signature-line {
              border-top: 1.5px dashed #64748b;
              margin-top: 50px;
              padding-top: 6px;
              font-weight: 600;
              color: #0f172a;
            }
            @media print {
              body {
                padding: 15px;
                font-size: 12px;
              }
              .header-card h1 {
                font-size: 22px;
              }
              .vital-value {
                font-size: 13px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-card">
            <h1>MADHAV ORTHOPEDIC HOSPITAL, INDI</h1>
            <p class="subtitle">Railway Station Road, Opp. Jio BP Petrol Pump, Indi &ndash; 586209</p>
            <p class="contact">Contact: 6362695499</p>
          </div>
          
          <div class="document-title">Discharge Summary</div>
          
          <table class="info-table">
            <tr>
              <td class="label">Patient Name:</td>
              <td class="value">${summary.patientName || "-"}</td>
              <td class="label">Consultant:</td>
              <td class="value">${summary.consultant || "-"}</td>
            </tr>
            <tr>
              <td class="label">Age/Sex:</td>
              <td class="value">${summary.ageSex || "-"}</td>
              <td class="label">Date of Admission:</td>
              <td class="value">${summary.dateOfAdmission ? new Date(summary.dateOfAdmission).toLocaleDateString("en-IN") : "-"}</td>
            </tr>
            <tr>
              <td class="label">PRN/IP No.:</td>
              <td class="value">${summary.prnIpNo || "-"}</td>
              <td class="label">Date of Discharge:</td>
              <td class="value">${summary.dateOfDischarge ? new Date(summary.dateOfDischarge).toLocaleDateString("en-IN") : "-"}</td>
            </tr>
            <tr>
              <td class="label">Address:</td>
              <td class="value" colspan="3">${summary.address || "-"}</td>
            </tr>
          </table>

          ${summary.finalDiagnosis ? `
          <div class="section">
            <div class="section-title">Final Diagnosis</div>
            <div class="section-content">${summary.finalDiagnosis}</div>
          </div>` : ""}

          ${summary.procedurePerformed ? `
          <div class="section">
            <div class="section-title">Procedure / Surgery Performed</div>
            <div class="section-content">${summary.procedurePerformed}</div>
          </div>` : ""}

          ${summary.presentingComplaints ? `
          <div class="section">
            <div class="section-title">Presenting Complaints</div>
            <div class="section-content">${summary.presentingComplaints}</div>
          </div>` : ""}

          ${summary.historyPresentIllness ? `
          <div class="section">
            <div class="section-title">History of Present Illness</div>
            <div class="section-content">${summary.historyPresentIllness}</div>
          </div>` : ""}

          <div class="section">
            <div class="section-title">Examination Findings</div>
            <div style="font-weight: 600; margin-bottom: 6px; color: #002366; font-size: 12px; text-transform: uppercase;">General Examination:</div>
            <div class="vitals-grid">
              <div class="vital-card">
                <div class="vital-label">Pulse</div>
                <div class="vital-value">${summary.pulse || "-"} bpm</div>
              </div>
              <div class="vital-card">
                <div class="vital-label">Blood Pressure</div>
                <div class="vital-value">${summary.bloodPressure || "-"}</div>
              </div>
              <div class="vital-card">
                <div class="vital-label">Temperature</div>
                <div class="vital-value">${summary.temperature || "-"} &deg;F</div>
              </div>
              <div class="vital-card">
                <div class="vital-label">Respiratory Rate</div>
                <div class="vital-value">${summary.respiratoryRate || "-"} /min</div>
              </div>
              <div class="vital-card">
                <div class="vital-label">SpO&sup2;</div>
                <div class="vital-value">${summary.spo2 || "-"} %</div>
              </div>
            </div>
            ${summary.localSystemicExam ? `
            <div style="font-weight: 600; margin-top: 10px; margin-bottom: 4px; color: #002366; font-size: 12px; text-transform: uppercase;">Local/Systemic Examination:</div>
            <div class="section-content">${summary.localSystemicExam}</div>` : ""}
          </div>

          <div class="section">
            <div class="section-title">Past History</div>
            <ul class="styled-list">
              <li><strong>Diabetes Mellitus:</strong> ${summary.diabetesMellitus || "No"}</li>
              <li><strong>Hypertension:</strong> ${summary.hypertension || "No"}</li>
              <li><strong>Previous Surgery:</strong> ${summary.previousSurgery || "None"}</li>
              <li><strong>Drug Allergy:</strong> ${summary.drugAllergy || "None"}</li>
              <li><strong>Other Significant History:</strong> ${summary.otherSignificantHistory || "None"}</li>
            </ul>
          </div>

          <div class="section">
            <div class="section-title">Investigations</div>
            <ul class="styled-list">
              ${summary.investigationCbc ? `<li><strong>CBC:</strong> ${summary.investigationCbc}</li>` : ""}
              ${summary.investigationEsr ? `<li><strong>ESR:</strong> ${summary.investigationEsr}</li>` : ""}
              ${summary.investigationCrp ? `<li><strong>CRP:</strong> ${summary.investigationCrp}</li>` : ""}
              ${summary.investigationRft ? `<li><strong>RFT:</strong> ${summary.investigationRft}</li>` : ""}
              ${summary.investigationLft ? `<li><strong>LFT:</strong> ${summary.investigationLft}</li>` : ""}
              ${summary.investigationBloodSugar ? `<li><strong>Blood Sugar:</strong> ${summary.investigationBloodSugar}</li>` : ""}
              ${summary.investigationImaging ? `<li><strong>X-ray / CT / MRI / Ultrasound (if applicable):</strong> ${summary.investigationImaging}</li>` : ""}
              ${summary.investigationOther ? `<li><strong>Other Relevant Investigations:</strong> ${summary.investigationOther}</li>` : ""}
            </ul>
          </div>
 
          ${summary.hospitalCourse ? `
          <div class="section">
            <div class="section-title">Hospital Course / Treatment Given</div>
            <div class="section-content">${summary.hospitalCourse}</div>
          </div>` : ""}

          ${summary.medicationsDuringStay ? `
          <div class="section">
            <div class="section-title">Medications Given During Hospital Stay</div>
            <div class="section-content">${summary.medicationsDuringStay}</div>
          </div>` : ""}

          <div class="section">
            <div class="section-title">Condition at Discharge</div>
            <ul class="styled-list">
              ${summary.consciousAndOriented ? "<li>Conscious and oriented</li>" : ""}
              ${summary.afebrile ? "<li>Afebrile</li>" : ""}
              ${summary.hemodynamicallyStable ? "<li>Hemodynamically stable</li>" : ""}
              ${summary.woundHealthy ? "<li>Wound healthy (if operated)</li>" : ""}
              ${summary.ambulatingAsTolerated ? "<li>Ambulating as tolerated</li>" : ""}
            </ul>
          </div>

          ${medListItems ? `
          <div class="section">
            <div class="section-title">Discharge Medications</div>
            <ol class="styled-list">
              ${medListItems}
            </ol>
          </div>` : ""}

          ${adviceListItems ? `
          <div class="section">
            <div class="section-title">Discharge Advice</div>
            <ul class="styled-list">
              ${adviceListItems}
            </ul>
          </div>` : ""}

          ${summary.followUp ? `
          <div class="section">
            <div class="section-title">Follow-up</div>
            <div class="section-content">${summary.followUp}</div>
          </div>` : ""}

          <div class="footer-signatures">
            <div class="signature-box">
              <div class="signature-line">Hospital Seal</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Doctor's Signature</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const filteredSummaries = summaries.filter((s) => {
    const name = s.patientName?.toLowerCase() || "";
    const prn = s.prnIpNo?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || prn.includes(query);
  });

  return (
    <Box p={3}>
      {view === "list" ? (
        <Paper elevation={2} sx={{ p: 3, borderRadius: "12px" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold" color="#002366">
              Discharge Summaries
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setView("form");
              }}
              sx={{
                background: "linear-gradient(90deg, #1E3A8A, #1E40AF)",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                "&:hover": { background: "#1e3a8a" },
              }}
            >
              New Discharge Summary
            </Button>
          </Stack>

          <TextField
            fullWidth
            placeholder="Search by Patient Name or PRN/IP No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
            }}
            sx={{ mb: 3 }}
          />

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "8px" }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>PRN/IP No.</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Patient Name</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Consultant</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Admission Date</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Discharge Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSummaries.length > 0 ? (
                    filteredSummaries.map((summary) => (
                      <TableRow key={summary.id} hover>
                        <TableCell>{summary.prnIpNo || "-"}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{summary.patientName}</TableCell>
                        <TableCell>{summary.consultant || "-"}</TableCell>
                        <TableCell>
                          {summary.dateOfAdmission ? new Date(summary.dateOfAdmission).toLocaleDateString("en-IN") : "-"}
                        </TableCell>
                        <TableCell>
                          {summary.dateOfDischarge ? new Date(summary.dateOfDischarge).toLocaleDateString("en-IN") : "-"}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => handlePrint(summary)} color="primary" title="Print">
                            <PrintIcon />
                          </IconButton>
                          <IconButton onClick={() => handleEdit(summary)} color="info" title="Edit">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(summary.id)} color="error" title="Delete">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No discharge summaries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ p: 4, borderRadius: "12px" }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <IconButton onClick={() => setView("list")}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color="#002366">
              {editingId ? "Edit Discharge Summary" : "New Discharge Summary"}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          {/* Form Content */}
          <Stack spacing={4}>
            {/* Section 1: Patient Information */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  1. Patient Information
                </Typography>
                <Stack spacing={3}>
                  {/* Row 1: Search & Select Patient */}
                  <Box sx={{ width: "100%" }}>
                    <Autocomplete
                      options={patients}
                      getOptionLabel={(option) => `${option.name} (${option.patientCode || ""})`}
                      value={selectedPatient}
                      onChange={handlePatientSelect}
                      renderInput={(params) => (
                        <TextField {...params} label="Search & Select Patient (Autofills Details)" required fullWidth />
                      )}
                    />
                  </Box>

                  {/* Row 2: Patient Name, Age/Sex, PRN/IP No. */}
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Patient Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        required
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Age / Sex"
                        value={ageSex}
                        onChange={(e) => setAgeSex(e.target.value)}
                        fullWidth
                        placeholder="e.g. 45/M"
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="PRN / IP No."
                        value={prnIpNo}
                        onChange={(e) => setPrnIpNo(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>

                  {/* Row 3: Consultant, Date of Admission, Date of Discharge */}
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <Autocomplete
                        freeSolo
                        options={doctors.map((d) => d.name)}
                        value={consultant}
                        onChange={(event, newValue) => setConsultant(newValue || "")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Consultant / Doctor"
                            onChange={(e) => setConsultant(e.target.value)}
                            fullWidth
                          />
                        )}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Date of Admission"
                        type="date"
                        value={dateOfAdmission}
                        onChange={(e) => setDateOfAdmission(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Date of Discharge"
                        type="date"
                        value={dateOfDischarge}
                        onChange={(e) => setDateOfDischarge(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Box>
                  </Box>

                  {/* Row 4: Address */}
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 2: Clinical Details */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  2. Clinical Summary
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      label="Final Diagnosis"
                      value={finalDiagnosis}
                      onChange={(e) => setFinalDiagnosis(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="Enter final diagnosis..."
                    />
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      label="Procedure / Surgery Performed"
                      value={procedurePerformed}
                      onChange={(e) => setProcedurePerformed(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                      placeholder="Details of procedure or surgery performed..."
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "350px" } }}>
                      <TextField
                        label="Presenting Complaints"
                        value={presentingComplaints}
                        onChange={(e) => setPresentingComplaints(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="Presenting complaints..."
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "350px" } }}>
                      <TextField
                        label="History of Present Illness"
                        value={historyPresentIllness}
                        onChange={(e) => setHistoryPresentIllness(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        placeholder="History of present illness..."
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 3: Examination Findings */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  3. Examination Findings
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" mb={2} sx={{ fontWeight: 600 }}>
                  General Examination
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: "100%", mb: 3 }}>
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                    <TextField label="Pulse (bpm)" value={pulse} onChange={(e) => setPulse(e.target.value)} fullWidth />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                    <TextField label="BP (mmHg)" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} fullWidth />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                    <TextField label="Temp (°F)" value={temperature} onChange={(e) => setTemperature(e.target.value)} fullWidth />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                    <TextField label="Resp Rate (/min)" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} fullWidth />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                    <TextField label="SpO₂ (%)" value={spo2} onChange={(e) => setSpo2(e.target.value)} fullWidth />
                  </Box>
                </Box>
                <Box sx={{ width: "100%" }}>
                  <TextField
                    label="Local / Systemic Examination"
                    value={localSystemicExam}
                    onChange={(e) => setLocalSystemicExam(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Enter local or systemic exam findings..."
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Section 4: Past History */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  4. Past History
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Diabetes Mellitus"
                        value={diabetesMellitus}
                        onChange={(e) => setDiabetesMellitus(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Hypertension"
                        value={hypertension}
                        onChange={(e) => setHypertension(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Previous Surgery"
                        value={previousSurgery}
                        onChange={(e) => setPreviousSurgery(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "350px" } }}>
                      <TextField
                        label="Drug Allergy"
                        value={drugAllergy}
                        onChange={(e) => setDrugAllergy(e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "350px" } }}>
                      <TextField
                        label="Other Significant History"
                        value={otherSignificantHistory}
                        onChange={(e) => setOtherSignificantHistory(e.target.value)}
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 5: Investigations */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  5. Investigations
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="CBC" value={investigationCbc} onChange={(e) => setInvestigationCbc(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="ESR" value={investigationEsr} onChange={(e) => setInvestigationEsr(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="CRP" value={investigationCrp} onChange={(e) => setInvestigationCrp(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="RFT" value={investigationRft} onChange={(e) => setInvestigationRft(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="LFT" value={investigationLft} onChange={(e) => setInvestigationLft(e.target.value)} fullWidth />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "140px" } }}>
                      <TextField label="Blood Sugar" value={investigationBloodSugar} onChange={(e) => setInvestigationBloodSugar(e.target.value)} fullWidth />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", width: "100%" }}>
                    <Box sx={{ flex: 1.5, minWidth: { xs: "100%", md: "350px" } }}>
                      <TextField
                        label="X-ray / CT / MRI / Ultrasound"
                        value={investigationImaging}
                        onChange={(e) => setInvestigationImaging(e.target.value)}
                        placeholder="Imaging investigations (if applicable)..."
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "250px" } }}>
                      <TextField
                        label="Other Relevant Investigations"
                        value={investigationOther}
                        onChange={(e) => setInvestigationOther(e.target.value)}
                        placeholder="Other lab tests or investigations..."
                        fullWidth
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 6: Hospital Course & Treatment */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  6. Hospital Course & Treatment
                </Typography>
                <Stack spacing={3}>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      label="Hospital Course / Treatment Given"
                      value={hospitalCourse}
                      onChange={(e) => setHospitalCourse(e.target.value)}
                      multiline
                      rows={3}
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      label="Medications Given During Hospital Stay"
                      value={medicationsDuringStay}
                      onChange={(e) => setMedicationsDuringStay(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      placeholder="Injectables or medications administered..."
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Section 7: Condition at Discharge */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  7. Condition at Discharge
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                  <FormControlLabel
                    control={<Checkbox checked={consciousAndOriented} onChange={(e) => setConsciousAndOriented(e.target.checked)} />}
                    label="Conscious and oriented"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={afebrile} onChange={(e) => setAfebrile(e.target.checked)} />}
                    label="Afebrile"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={hemodynamicallyStable} onChange={(e) => setHemodynamicallyStable(e.target.checked)} />}
                    label="Hemodynamically stable"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={woundHealthy} onChange={(e) => setWoundHealthy(e.target.checked)} />}
                    label="Wound healthy (if operated)"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={ambulatingAsTolerated} onChange={(e) => setAmbulatingAsTolerated(e.target.checked)} />}
                    label="Ambulating as tolerated"
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Section 8: Medications & Advice */}
            <Card variant="outlined" sx={{ borderRadius: "8px" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" color="#002366" mb={2}>
                  8. Discharge Medications & Advice
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" mb={1} sx={{ fontWeight: 600 }}>
                      Discharge Medications (Add each medicine on a separate line)
                    </Typography>
                    {dischargeMedicationsList.map((med, index) => (
                      <Stack direction="row" spacing={2} key={index} mb={1.5} alignItems="center">
                        <Typography width={20}>{index + 1}.</Typography>
                        <TextField
                          label={`Medication ${index + 1}`}
                          value={med}
                          onChange={(e) => handleMedicationChange(index, e.target.value)}
                          fullWidth
                          size="small"
                        />
                        <IconButton onClick={() => handleRemoveMedication(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    ))}
                    <Button variant="outlined" size="small" onClick={handleAddMedication} startIcon={<AddIcon />}>
                      Add Medication Line
                    </Button>
                  </Box>

                  <TextField
                    label="Discharge Advice (Enter each point on a new line)"
                    value={dischargeAdvice}
                    onChange={(e) => setDischargeAdvice(e.target.value)}
                    multiline
                    rows={5}
                    fullWidth
                  />

                  <TextField
                    label="Follow-up"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    fullWidth
                    placeholder="e.g. Review after 7 days or earlier if required."
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button variant="outlined" onClick={() => setView("list")}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave}>
              Save Discharge Summary
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
