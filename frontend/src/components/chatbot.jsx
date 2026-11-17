import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import "./chatbot.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hey there! 👋 Welcome to CampusCare. I'm your AI campus assistant. How can I help you today?",
      time: new Date()
    }
  ]);

  const suggestions = [
    "How do I submit a complaint?",
    "How can I track my complaint?",
    "How does AI work?"
  ];

  // Automatically scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, isTyping]);

  // SEND MESSAGE TO GEMINI AI
  const sendMessage = async (customMessage) => {
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

  try {
    const response = await api.post("/ai/chat", {
      message: userMessage
    });

    setMessages((previous) => [
      ...previous,
      {
        sender: "bot",
        text: response.data.reply,
        time: new Date()
      }
    ]);

  } catch (error) {
    console.error("Chatbot error:", error);

    setMessages((previous) => [
      ...previous,
      {
        sender: "bot",
        text: error.response?.data?.detail ||
          "Sorry, something went wrong. Please try again.",
        time: new Date()
      }
    ]);

  } finally {
    setIsTyping(false);
  }
};

  // FORMAT MESSAGE TIME
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
                  AI Assistant · Ready to help
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
                    disabled={isTyping}
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
              disabled={isTyping}
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
            Powered by CampusCare · Gemini AI
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