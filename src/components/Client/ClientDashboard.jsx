import React, { useState } from "react";
import AddProject from "./AddProject";

const dashboardSections = [
  { label: "📊 Dashboard Overview", key: "overview" },
  { label: "📁 Add Projects", key: "addProjects" },
  { label: "🛠️ Ticket Raising System", key: "tickets" },
  { label: "📦 Deliverables Tracker", key: "deliverables" },
  { label: "📣 Updates & Announcements", key: "updates" },
  { label: "💬 Communication Panel", key: "communication" },
  { label: "⚙️ Account & Profile Settings", key: "settings" },
];

// Placeholder components for demonstration
const Overview = () => <div>Dashboard Overview Section</div>;
const Tickets = () => <div>Ticket Raising System Section</div>;
const Deliverables = () => <div>Deliverables Tracker Section</div>;
const Updates = () => <div>Updates & Announcements Section</div>;
const Communication = () => <div>Communication Panel Section</div>;
const Settings = () => <div>Account & Profile Settings Section</div>;

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState(null);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <Overview />;
      case "addProjects":
        return <AddProject />;
      case "tickets":
        return <Tickets />;
      case "deliverables":
        return <Deliverables />;
      case "updates":
        return <Updates />;
      case "communication":
        return <Communication />;
      case "settings":
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", background: "#f9f9f9" }}>
      <h1 style={{ marginBottom: "2rem" }}>Client Dashboard</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
        {dashboardSections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            style={{
              padding: "1rem",
              fontSize: "1.1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f0f0f0'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            {section.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "2rem" }}>{renderSection()}</div>
    </main>
  );
} 