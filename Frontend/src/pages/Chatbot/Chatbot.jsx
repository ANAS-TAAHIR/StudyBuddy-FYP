import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUpload } from '@fortawesome/free-solid-svg-icons';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Dummy responses
  const generateDummyResponse = () => {
    const responses = [
      "Here's the explanation you're looking for...",
      "I understand your question! Let's dive into it.",
      "Good query! Let me explain in detail...",
      "Okay, here's some information that should help."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);

    const botMessage = { text: generateDummyResponse(), isUser: false };
    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput(""); // Clear input field
    textareaRef.current.style.height = "auto"; // Reset height to auto for re-calculation
    textareaRef.current.style.overflow = "hidden"; // Hide scrollbar
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents adding a new line
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Auto-resize logic
    textareaRef.current.style.height = "auto"; // Reset height
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`; // Grow up to 3 lines max
    textareaRef.current.style.overflow = textareaRef.current.scrollHeight > 96 ? "auto" : "hidden"; // Show scrollbar if content exceeds 3 lines
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col mt-20 mx-auto">
      
      {/* Messages Section */}
      <div className="flex-grow p-6 overflow-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.isUser ? 'bg-gray-100' : 'bg-white'} p-4 rounded-lg shadow-md max-w-xs whitespace-pre-wrap`}>
                {/* Add "whitespace-pre-wrap" to preserve line breaks */}
                <p className={`${msg.isUser ? 'text-gray-800' : 'text-gray-800'}`}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Fixed Input Section */}
      <div className="p-6 bg-white border-t fixed bottom-3 w-fill-available mr-12">
        <div className="flex items-center">
          <button className="mr-4">
            <FontAwesomeIcon icon={faUpload} size="lg" className="text-orange-400 hover:text-orange-600" />
          </button>
          <textarea
            ref={textareaRef}
            className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none overflow-hidden"
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
            style={{ maxHeight: "96px" }} // Maximum height set to 3 lines
          />
          <button className="ml-4" onClick={handleSendMessage}>
            <FontAwesomeIcon icon={faPaperPlane} size="lg" className="text-orange-400 hover:text-orange-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;