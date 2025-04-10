import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import "./HomePage.css";
import HeroSection from "./HeroSection";
import LearnAboutDonation from "./LearnAboutDonation";
import HowItWorks from "./HowItWorks";
import Contact from "./Contact";
import Footer from "./Footer";
import DonorFinder from "./DonorFinder.js";
import HospitalFinder from "./HospitalFinder.js";
import LiveCamps from "./LiveCamps.js";
import EligibilityChecker from "./EligibilityChecker.js";

const HomePage = () => {
  return (
    <div className="container-fluid p-0">
      <Header />
      <HeroSection />
      <LiveCamps />
      <DonorFinder />
      <HospitalFinder />
      <LearnAboutDonation />
      <EligibilityChecker />
      <HowItWorks />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
