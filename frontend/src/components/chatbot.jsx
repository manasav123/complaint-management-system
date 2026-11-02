import { useState } from "react";
import "./Chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 Welcome to the AI Complaint Management System. How can I help you?"
    }
  ]);

  const getBotResponse = (message) => {
    const text = message.toLowerCase();

    if (
      text.includes("track") ||
      text.includes("status") ||
      text.includes("progress")
    ) {
      return "You can track your complaint status from the My Complaints page. 📋";
    }

    if (
      text.includes("submit") ||
      text.includes("report an issue") ||
      text.includes("raise a complaint")
    ) {
      return "You can submit a complaint by logging in as a student and opening the Submit Complaint page. 📝";
    }

    if (text.includes("login") || text.includes("sign in")) {
      return "Click the Login button and enter your registered email and password. 🔐";
    }

    if (text.includes("register") || text.includes("signup")) {
      return "Click Register on the home page to create your account. 🎓";
    }

    if (text.includes("ai")) {
      return "Our system uses rule-based AI to identify complaint categories and priorities automatically. 🤖";
    }

    if (text.includes("image") || text.includes("photo")) {
      return "You can attach photographs as evidence when image uploading is available.";
    }

    if (
      text.includes("hello") ||
      text.includes("hi") ||
      text.includes("hey")
    ) {
      return "Hello! 😊 How can I assist you today?";
    }

    if (text.includes("thank")) {
      return "You're welcome! Happy to help. ❤️";
    }

    return "I'm here to help! Ask me about complaint submission, tracking, login, registration or AI classification.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage
      },
      {
        sender: "bot",
        text: getBotResponse(userMessage)
      }
    ]);

    setInput("");
  };

  return (
    <div className="chatbot-container">

      {isOpen && (
        <div className="chatbot-window">

          <div className="chatbot-header">
            <div>
              <h3>Campus Assistant 🤖</h3>
              <span>Online • Ready to help</span>
            </div>

            <button onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.sender}`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={sendMessage}>
              ➤
            </button>
          </div>

        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "✕" : "💬"}
      </button>

    </div>
  );
}

export default Chatbot;