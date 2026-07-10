import React from "react";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ============================================
// PAGES
// ============================================

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients/Patients";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Prescriptions from "./pages/Prescriptions";
import Medicines from "./pages/Medicines";
import Pharmacy from "./pages/PharmacyBilling";
import LabTests from "./pages/LabTests";
import ScanReports from "./pages/ScanReports";
import InvoiceHistory from "./pages/InvoiceHistory";
import SystemSettings from "./pages/SystemSettings";
import BedManagement from "./pages/Beds";
import PhysioManagement from "./pages/PhysioManagement";
import PharmacyHistory from "./pages/PharmacyHistory";
import PharmacyBillView from "./pages/PharmacyBillView";
import ProcedureMaster from "./pages/ProcedureMaster";
//import ProcedureEntry from "./pages/ProcedureEntry";
import ProcedureHistory from "./pages/ProcedureHistory";
import ProcedureBilling from "./pages/ProcedureBilling";
import ProcedureBillView from "./pages/ProcedureBillView";
import PatientProfile from "./pages/PatientProfile";
import LabResultEntry from "./pages/LabResultEntry"
import SupplierMaster from "./pages/SupplierMaster"
import PharmacyPurchase from "./pages/PharmacyPurchase"
import PurchaseRegister from "./pages/PurchaseRegister"
import CurrentStockRegister from "./pages/CurrentStockRegister"
import PurchaseReturn from "./pages/PurchaseReturn"
import DischargeSummary from "./pages/DischargeSummary";
import HRModule from "./pages/HRModule";

// ============================================
// COMPONENTS 
// ============================================

import MainLayout from "./layouts/MainLayout";
import UserMaster from "./pages/UserMaster";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}

        <Route path="/login" element={<Login />} />

        {/* DEFAULT */}

        <Route path="/" element={<Navigate to="/login" />} />

        {/* PROTECTED ROUTES */}

        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/doctors" element={<Doctors />} />

          <Route path="/patients" element={<Patients />} />

          <Route path="/appointments" element={<Appointments />} />

          <Route path="/billing" element={<Billing />} />

          <Route path="/prescriptions" element={<Prescriptions />} />

          <Route path="/medicines" element={<Medicines />} />

          <Route path="/PharmacyBilling" element={<Pharmacy />} />

          <Route path="/labtests" element={<LabTests />} />

          <Route path="/scanreports" element={<ScanReports />} />

          <Route path="/invoice-history" element={<InvoiceHistory />} />

          <Route path="/settings" element={<SystemSettings />} />

          <Route path="/beds" element={<BedManagement />} />

          <Route path="/userMaster" element={<UserMaster />} />
          <Route path="/physio" element={<PhysioManagement />} />

          <Route path="/PharmacyHistory" element={<PharmacyHistory />} />

          <Route path="/pharmacy-bill/:id" element={<PharmacyBillView />} />

          <Route path="/procedure-master" element={<ProcedureMaster />} />
          {/* <Route path="/procedure-entry" element={<ProcedureEntry />} /> */}
          <Route path="/procedure-history" element={<ProcedureHistory />} />

          <Route path="/procedure-billing" element={<ProcedureBilling />} />

          <Route path="/procedure-bill/:id" element={<ProcedureBillView />} />
          <Route path="/PatientProfile" element={<PatientProfile />} />
          <Route path="/PatientProfile/:patientId" element={<PatientProfile />}/>

          <Route path="/LabResultEntry" element={<LabResultEntry />} />

          <Route path="/SupplierMaster" element={<SupplierMaster />} />
          <Route path="/PharmacyPurchase" element={<PharmacyPurchase />} />

          <Route path="/PurchaseRegister" element={<PurchaseRegister />} />
          <Route path="/CurrentStockRegister" element={<CurrentStockRegister />} />
          <Route path="/PurchaseReturn" element={<PurchaseReturn />} />
          <Route path="/discharge-summary" element={<DischargeSummary />} />
          <Route path="/hr" element={<HRModule />} />
          <Route path="/hr/employees" element={<HRModule />} />
          <Route path="/hr/departments" element={<HRModule />} />
          <Route path="/hr/designations" element={<HRModule />} />
          <Route path="/hr/roles" element={<HRModule />} />
          <Route path="/hr/attendance" element={<HRModule />} />
          <Route path="/hr/shifts" element={<HRModule />} />
          <Route path="/hr/leave" element={<HRModule />} />
          <Route path="/hr/holidays" element={<HRModule />} />
          <Route path="/hr/payroll" element={<HRModule />} />
          <Route path="/hr/documents" element={<HRModule />} />
          <Route path="/hr/reports" element={<HRModule />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



