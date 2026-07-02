import React from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

export default function ProtectedRoute({
  children,
  page,
}) {
  // ============================================
  // TOKEN CHECK
  // ============================================

  const token =
    localStorage.getItem("token");

  // ============================================
  // USER NOT LOGGED IN
  // ============================================

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ============================================
  // PRIVILEGE CHECK
  // ============================================

  const privileges = JSON.parse(
    localStorage.getItem("privileges") || "[]"
  );

  if (
    page &&
    privileges.length > 0 &&
    !privileges.includes(page)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // ============================================
  // RENDER CHILDREN OR OUTLET
  // ============================================

  return <Outlet />;
}