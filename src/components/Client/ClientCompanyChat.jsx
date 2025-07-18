"use client"
import React, { useState } from 'react';

const ClientCompanyChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'company', text: 'Hello! How can we assist you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;

    const newMessage = { sender: 'client', text: input };
    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate company response
    setTimeout(() => {
      const companyReply = {
        sender: 'company',
        text: 'Thanks for your message! We will review and respond shortly.',
      };
      setMessages(prev => [...prev, companyReply]);
    }, 1000);
  };

  return (
    <div className="chat-container">
      <h2>💬 Client-Company Chat</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === 'client' ? 'client' : 'company'}`}
          >
            <strong>{msg.sender === 'client' ? 'You' : 'Company'}:</strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <style jsx>{`
        .chat-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          border-radius: 10px;
          background: #f5f5f5;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .chat-window {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 15px;
          padding: 10px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .chat-message {
          margin-bottom: 10px;
          padding: 10px;
          border-radius: 8px;
        }

        .chat-message.client {
          background-color: #e0f7fa;
          text-align: right;
        }

        .chat-message.company {
          background-color: #f1f8e9;
          text-align: left;
        }

        .chat-message span {
          display: block;
          margin-top: 5px;
        }

        .chat-input {
          display: flex;
          gap: 10px;
        }

        .chat-input input {
          flex: 1;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        .chat-input button {
          padding: 10px 20px;
          background-color: #0070f3;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .chat-input button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
};

export default ClientCompanyChat;
