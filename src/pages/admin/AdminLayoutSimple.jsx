import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/userContext";

const AdminLayoutSimple = () => {
  const { user: currentUser, loading } = useAuth();

  // Loading state
  if (loading) {
    return <div className="p-4">Loading admin dashboard...</div>;
  }

  // Temporarily disable auth checks for testing
  console.log("Current user:", currentUser);
  console.log("Loading:", loading);

  // Check if user is authorized for admin access
  if (!currentUser) {
    return (
      <div className="p-4">
        <h1 className="text-red-600">Authentication Required</h1>
        <p>You need to be logged in as a company user to access the admin dashboard.</p>
        <a href="/login" className="text-blue-600 underline">Go to Login</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-green-600">Simple Admin Layout - User Authenticated!</h1>
        <p className="mt-2">User: {currentUser?.first_name} {currentUser?.last_name}</p>
        <p>User Type: {currentUser?.user_type}</p>
        <p>Email: {currentUser?.email}</p>
        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayoutSimple;
