import React, { useState } from "react";

const UpdatesPage = () => {
  const [updates, setUpdates] = useState([
    {
      id: 1,
      title: "New API Version Released",
      date: "2025-07-15",
      description:
        "We’ve launched version 2.0 of the API with better performance and new endpoints.",
    },
    {
      id: 2,
      title: "UI Design Phase Completed",
      date: "2025-07-12",
      description:
        "The complete UI for your e-commerce project is now ready. Review and approve it in the deliverables section.",
    },
    {
      id: 3,
      title: "Maintenance Downtime",
      date: "2025-07-10",
      description:
        "Scheduled maintenance will occur on July 20th from 12:00 AM to 4:00 AM IST. Services may be temporarily unavailable.",
    },
  ]);

  return (
    <div className="updates-container">
      <h2>📢 Latest Updates</h2>
      <div className="updates-list">
        {updates.map((update) => (
          <div className="update-card" key={update.id}>
            <h3>{update.title}</h3>
            <p className="date">📅 {new Date(update.date).toLocaleDateString()}</p>
            <p>{update.description}</p>
          </div>
        ))}
      </div>

      <style jsx>{`
        .updates-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 30px 20px;
          background: #fafafa;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }

        h2 {
          text-align: center;
          margin-bottom: 25px;
          font-size: 1.8rem;
        }

        .updates-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .update-card {
          background: #ffffff;
          padding: 20px;
          border-left: 5px solid #0070f3;
          border-radius: 8px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
        }

        .update-card h3 {
          margin: 0 0 10px;
          font-size: 1.2rem;
        }

        .update-card .date {
          font-size: 0.9rem;
          color: #777;
          margin-bottom: 10px;
        }

        .update-card p {
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

export default UpdatesPage;
