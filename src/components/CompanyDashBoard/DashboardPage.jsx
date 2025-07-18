"use client";

import React, { useState } from "react";
import {
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineUserCircle,
  HiOutlineMail,
  HiOutlineChartBar,
} from "react-icons/hi";
import PendingProjects from "./PendingProjects";
import TicketRaising from "./TicketRaising";
import Inbox from "./Inbox";
import Deliverable from "./Deliverable";

const sections = [
  {
    key: "Pending Projects",
    label: "Pending Projects",
    icon: <HiOutlinePlusCircle size={22} />,
  },
  {
    key: "Deliverable",
    label: "Deliverable",
    icon: <HiOutlineClipboardList size={22} />,
  },
  {
    key: "Ticket Raising",
    label: "Ticket Raising",
    icon: <HiOutlineUserCircle size={22} />,
  },
  { key: "inbox", label: "Chat", icon: <HiOutlineMail size={22} /> },
 
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("eventForm");

  const renderSection = () => {
    switch (activeSection) {
      case "Pending Projects":
        return <PendingProjects />;
      case "Discoverable":
        return <Discoverable />;
      case "Ticket Raising":
        return <TicketRaising />;
      case "Chat":
        return <Deliverable />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-72 bg-[#2C3E50] text-white shadow-xl p-8 flex flex-col justify-between sticky top-0 h-screen">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <span className="inline-block bg-white bg-opacity-20 rounded-full p-2">
              <HiOutlineUserCircle size={36} />
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              Institute Panel
            </span>
          </div>
          <nav className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.key}
                className={`flex items-center gap-3 px-5 py-3 rounded-lg transition font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-blue-800
                  ${
                    activeSection === section.key
                      ? "bg-white bg-opacity-90 text-blue-800 shadow-lg"
                      : "hover:bg-white/20 hover:text-white/90 text-white/80"
                  }`}
                onClick={() => setActiveSection(section.key)}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-10 text-xs text-white/60 text-center">
          &copy; {new Date().getFullYear()} SyncWise. All rights reserved.
        </div>
      </aside>
      <main className="flex-1 p-10 md:p-16 bg-[#F5F7F9] min-h-screen">
        <div className="max-w-5xl mx-auto">{renderSection()}</div>
      </main>
    </div>
  );
}
