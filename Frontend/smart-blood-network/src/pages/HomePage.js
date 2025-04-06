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

const HomePage = () => {
  return (
    <div className="container-fluid p-0">
      <Header />
      <HeroSection />
      <DonorFinder />
      <HospitalFinder />
      <LearnAboutDonation />
      <HowItWorks />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
