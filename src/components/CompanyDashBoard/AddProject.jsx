"use client";
import React, { useState } from "react";

export default function AddProject() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the data
    console.log({
      projectName,
      description,
      startDate,
      endDate,
      file,
    });
    // Optionally, reset form
    setProjectName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px #eee" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Add Project</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Project Name*:<br />
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Description:<br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Start Date:<br />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          End Date:<br />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label>
          Project Documentation:<br />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginTop: 4 }}
          />
        </label>
      </div>
      <button type="submit" style={{ padding: "0.75rem 1.5rem", borderRadius: 6, border: "none", background: "#0070f3", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        Add Project
      </button>
    </form>
  );
}
