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
      </Routes>
    </Router>
  );
}

export default App;
