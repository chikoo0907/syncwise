"use client"
import React from "react";

const Overview = () => {
  const overviewData = {
    activeProjects: 4,
    openTickets: 2,
    upcomingDeadlines: 3,
    newUpdates: 5,
  };

  const cards = [
    {
      label: "Active Projects",
      value: overviewData.activeProjects,
      icon: "📁",
      color: "#0070f3",
    },
    {
      label: "Open Tickets",
      value: overviewData.openTickets,
      icon: "🎫",
      color: "#ff6347",
    },
    {
      label: "Upcoming Deadlines",
      value: overviewData.upcomingDeadlines,
      icon: "⏰",
      color: "#ffa500",
    },
    {
      label: "New Updates",
      value: overviewData.newUpdates,
      icon: "📰",
      color: "#28a745",
    },
  ];

  return (
    <div className="overview-container">
      <h2>📊 Dashboard Overview</h2>
      <div className="overview-grid">
        {cards.map((card, index) => (
          <div className="overview-card" key={index} style={{ borderLeft: `6px solid ${card.color}` }}>
            <div className="icon">{card.icon}</div>
            <div className="details">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .overview-container {
          max-width: 1000px;
          margin: auto;
          padding: 30px 20px;
          background: #f9f9f9;
          border-radius: 12px;
        }

        h2 {
          text-align: center;
          margin-bottom: 30px;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .overview-card {
          display: flex;
          align-items: center;
          background: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease;
        }

        .overview-card:hover {
          transform: translateY(-4px);
        }

        .icon {
          font-size: 2rem;
          margin-right: 15px;
        }

        .details h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .details p {
          margin: 4px 0 0;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Overview;
