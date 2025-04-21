import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import {
  Send,
  Loader2,
  Info,
  MapPin,
  ListOrdered,
  Droplet,
  HeartPulse,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "Chatbot",
      text: "👋 Hello! I'm your Blood Donation Assistant. How can I help you today?",
      icon: <Droplet className="text-red-500" size={20} />,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message = input) => {
    const safeMessage = typeof message === "string" ? message : "";
    if (!safeMessage.trim()) return;

    const userMessage = { sender: "You", text: safeMessage };
    setMessages((prev) => [...prev, userMessage]);
    if (message === input) setInput("");
    setLoading(true);

    try {
      const API_URL =
        process.env.REACT_APP_CHATBOT_API_URL ||
        "http://127.0.0.1:5002/chatbot";
      const response = await axios.post(`${API_URL}`, {
        message: safeMessage,
      });

      let botText = "";
      let icon = <Info className="text-blue-500" size={20} />;

      if (response.data.centers) {
        botText = `${response.data.message}\n${response.data.centers
          .map(
            (center) =>
              `• ${center.Center_Name} (${center.Location}, ${center.Contact})\n  Eligibility: ${center.Eligibility_Criteria}`
          )
          .join("\n")}`;
        icon = <MapPin className="text-green-500" size={20} />;
      } else if (response.data.steps) {
        botText = `${response.data.message}\n${response.data.steps
          .map((step, i) => `${i + 1}. ${step}`)
          .join("\n")}`;
        icon = <ListOrdered className="text-purple-500" size={20} />;
      } else if (response.data.message) {
        botText = response.data.message;
        if (botText.includes("eligibility") || botText.includes("eligible")) {
          icon = <HeartPulse className="text-red-500" size={20} />;
        }
      } else {
        botText =
          "🤖 Sorry, I didn't understand that. Try asking about donation centers, eligibility criteria, or the donation process!";
      }

      const botMessage = { sender: "Chatbot", text: botText, icon };

      setTimeout(() => {
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000 + Math.random() * 500);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "Chatbot",
          text: "❌ Connection error. Please try again later.",
          icon: <Info className="text-red-500" size={20} />,
        },
      ]);
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    { text: "Centers in Mumbai", icon: <MapPin size={16} /> },
    { text: "Can I donate if pregnant?", icon: <HeartPulse size={16} /> },
    { text: "How to donate blood?", icon: <ListOrdered size={16} /> },
    { text: "What are blood groups?", icon: <Droplet size={16} /> },
    { text: "Why donate blood?", icon: <Info size={16} /> },
  ];

  return (
    <div className="chatbotContainer">
      <div className="header">
        <div className="headerContent">
          <h1 className="title">Blood Donation Assistant</h1>
          <p className="subtitle">Ask me anything about blood donation</p>
        </div>
      </div>

      <div className="chatArea">
        <Card className="chatCard">
          <CardContent ref={chatContainerRef} className="chatContent">
            <div className="messageContainer">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: msg.sender === "You" ? 20 : -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${
                      msg.sender === "You" ? "userMessage" : "botMessage"
                    }`}
                  >
                    <div
                      className={`messageBubble ${
                        msg.sender === "You" ? "userBubble" : "botBubble"
                      }`}
                    >
                      <div className="messageContent">
                        {msg.sender === "Chatbot" && (
                          <div className="messageIcon">{msg.icon}</div>
                        )}
                        <div className="messageText">
                          <div
                            className={`senderName ${
                              msg.sender === "You" ? "userSender" : "botSender"
                            }`}
                          >
                            {msg.sender}:
                          </div>
                          <div className="messageBody">
                            {msg.text.split("\n").map((line, i) => (
                              <p
                                key={i}
                                className={
                                  line.startsWith("•") || line.startsWith("1.")
                                    ? "listItem"
                                    : ""
                                }
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start w-full">
                  <div className="loadingIndicator">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm ml-1">
                      Finding the best information for you...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="inputArea">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Type your question..."
              className="flex-1 min-w-0 text-sm p-2 rounded-lg border border-gray-300"
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="ml-2 p-2 text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
          <div className="suggestedQuestions">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                onClick={() => sendMessage(question.text)}
                className="text-xs p-1.5 rounded-md bg-white border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
              >
                {question.icon}
                {question.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
