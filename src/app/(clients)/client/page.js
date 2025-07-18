"use client"
import React from 'react';
import ClientDashboard from "@/components/Client/ClientDashboard";
import AddProject from "@/components/Client/AddProject";
import TicketRaise from "@/components/Client/TicketRaise";
import Deliverables from "@/components/Client/Deliverables";

const ClientPage = () => {
  return (
    <div style={{ padding: '20px' }}>
    <ClientDashboard />
    <AddProject />
    <TicketRaise />
    <Deliverables />
    </div>
  );
};

export default ClientPage;