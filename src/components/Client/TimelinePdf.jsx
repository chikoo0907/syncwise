import React from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Props:
 * - projectName: string
 * - timelineItems: array of { title, description, startDate, dueDate, status }
 */
const FinalDeliverablePdf = ({ projectName, timelineItems }) => {
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Final Deliverable PDF`, 14, 16);
    doc.setFontSize(12);
    doc.text(`Project Name: ${projectName || "-"}`, 14, 26);
    doc.text(`Final Deliverable Summary`, 14, 36);

    // Table columns
    const columns = [
      { header: "No.", dataKey: "no" },
      { header: "Title", dataKey: "title" },
      { header: "Description", dataKey: "description" },
      { header: "Start Date", dataKey: "startDate" },
      { header: "End Date", dataKey: "dueDate" },
      { header: "Status", dataKey: "status" },
    ];

    // Table rows
    const rows = timelineItems.map((item, idx) => ({
      no: idx + 1,
      title: item.title || "-",
      description: item.description || "-",
      startDate: item.startDate
        ? new Date(item.startDate).toLocaleDateString()
        : "-",
      dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-",
      status: item.status || "-",
    }));

    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: rows.map((row) => columns.map((col) => row[col.dataKey])),
      startY: 44,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(
      `${
        projectName ? projectName.replace(/\s+/g, "_") : "final_deliverable"
      }_final_deliverable.pdf`
    );
  };

  return (
    <button
      onClick={handleDownload}
      className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Download Final Deliverable PDF
    </button>
  );
};

export default FinalDeliverablePdf;
