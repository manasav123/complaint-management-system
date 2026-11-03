import { useEffect, useRef, useState } from "react";
import "./chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! 👋 Welcome to CampusCare. I'm your campus assistant. How can I help you today?",
      time: new Date()
    }
  ]);

  const suggestions = [
    "How do I submit a complaint?",
    "How can I track my complaint?",
    "How does AI work?"
  ];

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
      return "You can attach photographs as evidence when submitting a complaint. 📸";
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  const sendMessage = (customMessage) => {
    const userMessage = (customMessage || input).trim();

    if (!userMessage || isTyping) return;

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: userMessage,
        time: new Date()
      }
    ]);

    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: getBotResponse(userMessage),
          time: new Date()
        }
      ]);

      setIsTyping(false);
    }, 900);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="chatbot-container">

      {isOpen && (

        <div className="chatbot-window">

          {/* HEADER */}

          <div className="chatbot-header">

            <div className="chatbot-profile">

              <div className="chatbot-avatar">
                🤖
                <span className="chatbot-online-dot"></span>
              </div>

              <div className="chatbot-header-info">
                <h3>CampusCare Assistant</h3>
                <span>
                  <span className="online-indicator"></span>
                  Online · Ready to help
                </span>
              </div>

            </div>

            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>

          </div>


          {/* WELCOME BANNER */}

          <div className="chatbot-welcome">

            <div className="chatbot-welcome-icon">
              ✨
            </div>

            <div>
              <strong>How can I help you?</strong>
              <p>Ask me anything about CampusCare.</p>
            </div>

          </div>


          {/* MESSAGES */}

          <div className="chatbot-messages">

            {messages.map((message, index) => (

              <div
                key={index}
                className={`chatbot-message-group ${message.sender}`}
              >

                {message.sender === "bot" && (
                  <div className="chatbot-message-avatar">
                    🤖
                  </div>
                )}

                <div className="chatbot-message-content">

                  <div className={`chat-message ${message.sender}`}>
                    {message.text}
                  </div>

                  <span className="chatbot-message-time">
                    {formatTime(message.time)}
                  </span>

                </div>

              </div>

            ))}


            {/* TYPING INDICATOR */}

            {isTyping && (

              <div className="chatbot-message-group bot">

                <div className="chatbot-message-avatar">
                  🤖
                </div>

                <div className="chatbot-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            )}


            <div ref={messagesEndRef}></div>

          </div>


          {/* SUGGESTIONS */}

          {messages.length === 1 && (

            <div className="chatbot-suggestions">

              <span>QUICK QUESTIONS</span>

              <div className="chatbot-suggestion-list">

                {suggestions.map((suggestion, index) => (

                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                  >
                    {suggestion} →
                  </button>

                ))}

              </div>

            </div>

          )}


          {/* INPUT */}

          <form
            className="chatbot-input"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >

            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              ➤
            </button>

          </form>


          <div className="chatbot-footer">
            Powered by CampusCare · Rule-based Assistant
          </div>

        </div>

      )}


      {/* FLOATING BUTTON */}

      <button
        className={`chatbot-toggle ${isOpen ? "chatbot-toggle-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? "✕" : "💬"}
      </button>

    </div>
  );
}

export default Chatbot;