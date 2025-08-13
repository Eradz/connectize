import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayoutClean from "./AdminLayoutClean";
import AdminSimpleTest from "./AdminSimpleTest";
import AdminAnalytics from "./AdminAnalytics";
import AdminUsersManagement from "./AdminUsersManagement";
import AdminCompaniesManagement from "./AdminCompaniesManagement";
import AdminProductsManagement from "./AdminProductsManagement";
import AdminServicesManagement from "./AdminServicesManagement";
import AdminPostsManagement from "./AdminPostsManagement";
import AdminMessagesManagement from "./AdminMessagesManagement";
import AdminNotificationsManagement from "./AdminNotificationsManagement";
import AdminSettings from "./AdminSettings";

const AdminRoutes = () => {
  return (
    <AdminLayoutClean>
      <Routes>
        <Route path="/" element={<AdminSimpleTest />} />
        <Route path="/users" element={<AdminUsersManagement />} />
        <Route path="/companies" element={<AdminCompaniesManagement />} />
        <Route path="/products" element={<AdminProductsManagement />} />
        <Route path="/services" element={<AdminServicesManagement />} />
        <Route path="/posts" element={<AdminPostsManagement />} />
        <Route path="/messages" element={<AdminMessagesManagement />} />
        <Route path="/notifications" element={<AdminNotificationsManagement />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Routes>
    </AdminLayoutClean>
  );
};

export default AdminRoutes;
