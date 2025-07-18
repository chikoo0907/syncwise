"use client"
import React, { useState } from "react";
import AddProject from "./AddProject";
import TicketRaise from "./TicketRaise";
import DeliverablesTracker from "./DeliverablesTracker";
import UpdatesPage from "./UpdatesPage";
import ClientCompanyChat from "./ClientCompanyChat";
import Overview from "./Overview";
import AccountSettings from "./AccountSettings";
  const dashboardSections = [
  { label: "📊 Overview", key: "overview" },
  { label: "📁 Add Projects", key: "addProjects" },
  { label: "🛠️ Tickets", key: "tickets" },
  { label: "📦 Deliverables", key: "deliverables" },
  { label: "📣 Updates", key: "updates" },
  { label: "💬 Communication", key: "communication" },
  { label: "⚙️ Settings", key: "settings" },
];

// Remove duplicate Overview definition
const Tickets = () => <TicketRaise />;
const Deliverables = () => <DeliverablesTracker />;
const Updates = () => <UpdatesPage />;
const Communication = () => <ClientCompanyChat />;
const Settings = () => <AccountSettings />;

export default function ClientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");

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
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "sans-serif",
      background: "#f4f6f8"
    }}>
      {/* Sidebar */}
      <nav style={{
        width: 220,
        background: "#1a2233",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "2rem 1rem",
        boxShadow: "2px 0 8px #0001"
      }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 40, letterSpacing: 1 }}>
          CompanyName
        </div>
        {dashboardSections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            style={{
              background: activeSection === section.key ? "#2d3a4d" : "transparent",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.75rem 1rem",
              marginBottom: 8,
              textAlign: "left",
              fontSize: 16,
              cursor: "pointer",
              fontWeight: activeSection === section.key ? 600 : 400,
              transition: "background 0.2s"
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>
      {/* Main Content */}
      <div style={{ flex: 1, padding: "2.5rem 3rem" }}>
        {/* Header */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem"
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "#1a2233" }}>
            {dashboardSections.find(s => s.key === activeSection)?.label.replace(/^[^a-zA-Z]+/, '')}
          </h1>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem"
          }}>
            <span style={{ fontWeight: 500 }}>John Doe</span>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 18
            }}>
              JD
            </div>
          </div>
        </header>
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px #0001",
          padding: "2rem",
          minHeight: 400
        }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
} 