// src/router.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";

import Signin from "./pages/Signin";
import LoginForm from "./components/auth/LoginForm";
import UserRegistration from "./pages/UserRegistration";
import RecoverPassword from "./pages/RecoverPassword";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import AddQuestion from "./pages/AddQuestion";
import QuestionsApproval from "./pages/QuestionsApproval";
import Subjects from "./pages/Subjects";
import ChangePassword from "./pages/ChangePassword";
import ChangeEmail from "./pages/ChangeEmail";
import Unauthorized from "./pages/Unauthorized";
import AdminTeacherApproval from "./pages/AdminTeacherApproval";


export default function Router() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<Layout currentPageName="Signin"><Signin /></Layout>} />
      <Route path="/login" element={<Layout currentPageName="Signin"><LoginForm /></Layout>} />
      <Route path="/register" element={<Layout currentPageName="UserRegistration"><UserRegistration /></Layout>} />
      <Route path="/recoverpassword" element={<Layout currentPageName="RecoverPassword"><RecoverPassword /></Layout>} />

      {/* Authenticated Routes */}
      <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
      <Route path="/profile" element={<Layout currentPageName="Profile"><Profile /></Layout>} />
      <Route path="/addquestion" element={<Layout currentPageName="AddQuestion"><AddQuestion /></Layout>} />
      <Route path="/questionsapproval" element={<Layout currentPageName="QuestionsApproval"><QuestionsApproval /></Layout>} />
      <Route path="/adminteacherapproval" element={<Layout currentPageName="AdminTeacherApproval"><AdminTeacherApproval /></Layout>} />
      <Route path="/subjects" element={<Layout currentPageName="Subjects"><Subjects /></Layout>} />
      <Route path="/changepassword" element={<Layout currentPageName="ChangePassword"><ChangePassword /></Layout>} />
      <Route path="/changeemail" element={<Layout currentPageName="ChangeEmail"><ChangeEmail /></Layout>} />

      {/* Fallback / Unauthorized */}
      <Route path="/unauthorized" element={<Layout currentPageName="Unauthorized"><Unauthorized /></Layout>} />
      <Route path="*" element={<Layout currentPageName="NotFound"><div className="text-center p-8">404 - הדף לא נמצא</div></Layout>} />
    </Routes>
  );
}
