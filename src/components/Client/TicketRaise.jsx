import React, { useState } from "react";

const RaiseTicketForm = () => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    description: "",
    attachment: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "attachment" ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., API call)
    const ticketData = new FormData();
    ticketData.append("subject", formData.subject);
    ticketData.append("category", formData.category);
    ticketData.append("description", formData.description);
    if (formData.attachment) {
      ticketData.append("attachment", formData.attachment);
    }

    console.log("Submitting ticket:", Object.fromEntries(ticketData.entries()));
    // You can send this to your backend with fetch or axios
  };

  return (
    <div className="ticket-form-container">
      <h2>Raise a Support Ticket</h2>
      <form onSubmit={handleSubmit} className="ticket-form">
        <label>Subject</label>
        <input
          type="text"
          name="subject"
          placeholder="Enter issue title"
          value={formData.subject}
          onChange={handleChange}
          required
        />

        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Category --</option>
          <option value="bug">Bug / Error</option>
          <option value="feature">Feature Request</option>
          <option value="query">General Query</option>
        </select>

        <label>Description</label>
        <textarea
          name="description"
          rows="5"
          placeholder="Describe the issue in detail..."
          value={formData.description}
          onChange={handleChange}
          required
        />

        <label>Attach File (optional)</label>
        <input
          type="file"
          name="attachment"
          onChange={handleChange}
        />

        <button type="submit">Submit Ticket</button>
      </form>

      <style jsx>{`
        .ticket-form-container {
          max-width: 500px;
          margin: auto;
          background: #f7f9fc;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px #ddd;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .ticket-form label {
          display: block;
          margin-top: 15px;
          font-weight: bold;
        }
        .ticket-form input[type="text"],
        .ticket-form select,
        .ticket-form textarea,
        .ticket-form input[type="file"] {
          width: 100%;
          padding: 10px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .ticket-form button {
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .ticket-form button:hover {
          background-color: #005ac1;
        }
      `}</style>
    </div>
  );
};

export default RaiseTicketForm;
