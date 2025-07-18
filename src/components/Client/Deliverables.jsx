"use client"
import React, { useState } from "react";

const DeliverablesTracker = () => {
  const [deliverables, setDeliverables] = useState([
    {
      id: 1,
      name: "Website UI Design",
      type: "Figma File",
      status: "Delivered",
      fileUrl: "https://example.com/ui-design.fig",
      notes: "Initial version uploaded.",
    },
    {
      id: 2,
      name: "Backend API",
      type: "Postman Collection",
      status: "In Progress",
      fileUrl: "",
      notes: "API development is 80% complete.",
    },
    {
      id: 3,
      name: "Documentation",
      type: "PDF",
      status: "Pending",
      fileUrl: "",
      notes: "Will be added after testing phase.",
    },
  ]);

  return (
    <div className="tracker-container">
      <h2>📦 Deliverables Tracker</h2>
      <table className="deliverable-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Deliverable</th>
            <th>Type</th>
            <th>Status</th>
            <th>File</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {deliverables.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>
                <span className={`status ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </td>
              <td>
                {item.fileUrl ? (
                  <a href={item.fileUrl} target="_blank" rel="noreferrer">
                    Download
                  </a>
                ) : (
                  "Not Available"
                )}
              </td>
              <td>{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <style jsx>{`
        .tracker-container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 12px;
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.5rem;
        }

        .deliverable-table {
          width: 100%;
          border-collapse: collapse;
        }

        .deliverable-table th,
        .deliverable-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: center;
        }

        .deliverable-table th {
          background-color: #f1f1f1;
        }

        .status {
          padding: 5px 10px;
          border-radius: 5px;
          color: #fff;
          font-weight: 500;
        }

        .status.pending {
          background-color: #ff9800;
        }

        .status["in progress"] {
          background-color: #03a9f4;
        }

        .status.delivered {
          background-color: #4caf50;
        }
      `}</style>
    </div>
  );
};

export default DeliverablesTracker;
