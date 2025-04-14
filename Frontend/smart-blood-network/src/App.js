import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegistrationPage from "./pages/RegistrationPage";
import LoginPage from "./pages/LoginPage";
import UrgentBloodRequest from "./pages/UrgentBloodRequest";
import ProfilePage from "./pages/ProfilePage";
import UpdateProfile from "./pages/UpdateProfile";
import CampRegistration from "./pages/CampRegistration";
import BloodDonorEligibility from "./pages/EligibilityChecker";
import NearByCamps from "./pages/NearByCamps";
import CampManagement from "./pages/CampManagement";
import EligibilityCheckerPage from "./pages/EligibilityCheckerPage";
import UserManagement from "./pages/UserManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/request-blood" element={<UrgentBloodRequest />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/register-blood-camp" element={<CampRegistration />} />
        <Route path="/blood-camps" element={<NearByCamps />} />
        <Route path="/manage-blood-camps" element={<CampManagement />} />
        <Route path="/eligibility-checker" element={<EligibilityCheckerPage />}/>
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
