"use client"
import React from 'react';
import ClientDashboard from "@/components/Client/ClientDashboard";
import AddProject from "@/components/Client/AddProject";
import TicketRaise from "@/components/Client/TicketRaise";
import DeliverablesTracker from "@/components/Client/DeliverablesTracker";
import UpdatesPage from "@/components/Client/UpdatesPage";
import ClientCompanyChat from "@/components/Client/ClientCompanyChat";
import Overview from "@/components/Client/Overview";
import AccountSettings from "@/components/Client/AccountSettings";
const ClientPage = () => {
  return (
    <div style={{ padding: '20px' }}>
    <ClientDashboard />
    
    </div>
  );
};

export default ClientPage;