import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./EligibilityChecker.css";

const questions = [
  {
    question: "Are you at least 18 years old?",
    disqualifyIf: "no",
    reason: "You must be at least 18 years old to donate blood.",
  },
  {
    question: "Do you weigh at least 50 kg (110 lbs)?",
    disqualifyIf: "no",
    reason: "You must weigh at least 50 kg to safely donate blood.",
  },
  {
    question: "Have you donated blood in the last 3–4 months?",
    disqualifyIf: "yes",
    reason: "You need to wait before donating again.",
  },
  {
    question: "Are you currently feeling healthy and well?",
    disqualifyIf: "no",
    reason: "You must feel well on the day of donation.",
  },
  {
    question: "Have you had a fever or flu in the last 14 days?",
    disqualifyIf: "yes",
    reason: "Please wait until fully recovered from any illness.",
  },
  {
    question: "Do you have any chronic illness?",
    disqualifyIf: "yes",
    reason: "Chronic conditions may affect donation eligibility.",
  },
  {
    question: "Have you had a tattoo or piercing in the last 6 months?",
    disqualifyIf: "yes",
    reason: "You must wait 6 months due to infection risk.",
  },
  {
    question: "Have you traveled to a malaria-prone area recently?",
    disqualifyIf: "yes",
    reason: "Travel to malaria zones requires a wait period.",
  },
  {
    question: "Have you ever tested positive for HIV/AIDS or hepatitis B/C?",
    disqualifyIf: "yes",
    reason: "You are not eligible to donate blood.",
  },
  {
    question: "Are you currently on antibiotics or under medical treatment?",
    disqualifyIf: "yes",
    reason: "Wait until you're done with treatment and feeling well.",
  },
];

function EligibilityChecker() {
  const [step, setStep] = useState(0);
  const [ineligible, setIneligible] = useState(false);
  const [reason, setReason] = useState("");
  const [completed, setCompleted] = useState(false);

  const handleAnswer = (answer) => {
    const current = questions[step];
    if (answer === current.disqualifyIf) {
      setIneligible(true);
      setReason(current.reason);
    } else if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const restart = () => {
    setStep(0);
    setIneligible(false);
    setReason("");
    setCompleted(false);
  };

  const progress =
    ((step + (completed || ineligible ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="ec-container">
      <h1 className="ec-heading">Check Your Eligibility</h1>
      {/* Progress bar */}
      <div className="ec-progress-container">
        <motion.div
          className="ec-progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!ineligible && !completed && (
          <motion.div
            key={step}
            className="ec-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <p className="ec-step">
              Question {step + 1} of {questions.length}
            </p>
            <h3>{questions[step].question}</h3>
            <div className="ec-btn-group">
              <button
                onClick={() => handleAnswer("yes")}
                className="ec-btn ec-btn-yes"
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer("no")}
                className="ec-btn ec-btn-no"
              >
                No
              </button>
            </div>
          </motion.div>
        )}

        {ineligible && (
          <motion.div
            key="fail"
            className="ec-card ec-card-red"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2>Sorry, you're not eligible to donate blood.</h2>
            <p className="ec-reason">{reason}</p>
            <p className="ec-note">
              Note: This is a preliminary check. Final eligibility will be
              determined by medical professionals at the donation center.
            </p>
            <button className="ec-btn ec-btn-retry" onClick={restart}>
              Try Again
            </button>
          </motion.div>
        )}

        {completed && (
          <motion.div
            key="success"
            className="ec-card ec-card-green"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2>✅ You're eligible to donate blood!</h2>
            <p className="ec-reason">Thank you for being a lifesaver 💓</p>
            <p className="ec-note">
              Note: This is a preliminary check. Final eligibility will be
              determined by medical professionals at the donation center.
            </p>
            <button className="ec-btn ec-btn-retry" onClick={restart}>
              Check Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EligibilityChecker;
