"use client";

import React, { useState } from "react";
import {
  HiOutlineClipboardList,
  HiOutlineUserCircle,
  HiOutlineMail,
  HiOutlineChartBar,
  HiOutlineBell,
  HiOutlineLogout,
} from "react-icons/hi";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import TicketRaise from "./TicketRaise";
import TimelineTracker from "./TimelineTracker";
import ProjectsPage from "./ProjectsPage";
import ClientCompanyChat from "./ClientCompanyChat";

const sections = [
  {
    key: "Tickets",
    label: "Tickets",
    icon: <HiOutlineClipboardList size={22} />,
  },
  {
    key: "Timeline",
    label: "Timeline",
    icon: <HiOutlineChartBar size={22} />,
  },
  {
    key: "MyProjects",
    label: "Projects",
    icon: <HiOutlineBell size={22} />,
  },
  {
    key: "Chat",
    label: "Chat",
    icon: <HiOutlineMail size={22} />,
  },
];

export default function ClientDashboardPage() {
  const [activeSection, setActiveSection] = useState("Tickets");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Tickets":
        return <TicketRaise />;
      case "Timeline":
        return <TimelineTracker />;
      case "MyProjects":
        return <ProjectsPage />;
      case "Chat":
        return <ClientCompanyChat />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-80 bg-[#a3c5e0] shadow-2xl shadow-[#496c9c] p-8 flex flex-col justify-between sticky top-0 h-screen rounded-br-4xl rounded-tr-4xl">
        <div>
          <div className="flex flex-col items-center gap-3 mb-10">
            <span className="inline-block bg-[#e6f4fa] rounded-2xl w-20">
            <img src="/logo.png" />
            </span>
            <div>
              <p className=" text-sm text-gray-500">Client Panel</p>
            </div>
          </div>
          <nav className="flex flex-col gap-6">
            {sections.map((section) => (
              <button
                key={section.key}
                className={`flex items-center gap-3 px-6 py-2 rounded-2xl transition-all duration-200 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[#00B2E2] focus:ring-opacity-50
                  ${
                    activeSection === section.key
                      ? "bg-[#00B2E2] text-white shadow-lg transform scale-105"
                      : "hover:bg-[#e6f4fa] hover:text-[#00B2E2] text-gray-600"
                  }`}
                onClick={() => setActiveSection(section.key)}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-1/2 flex items-center justify-center gap-3 px-2 py-2 rounded-2xl transition-all duration-200 font-medium text-md bg-red-50 hover:bg-red-100 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
          >
            <HiOutlineLogout size={22} />
            Logout
          </button>
          <div className="text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} SyncWise. All rights reserved.
          </div>
        </div>
      </aside>
      <main className="flex-1 px-8 lg:p-12">
        <div className="max-w-6xl mx-auto ">
          <div className="rounded-lg shadow-lg p-8">{renderSection()}</div>
        </div>
      </main>
    </div>
  );
}
