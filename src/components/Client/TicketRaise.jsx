"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { safeSortByDate, handleFirebaseError } from "@/lib/utils";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Plus,
  FileText,
} from "lucide-react";

export default function TicketRaise() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    description: "",
    priority: "medium",
    projectId: "",
    projectName: "",
  });

  useEffect(() => {
    fetchClientAndTickets();
    fetchProjects();
  }, []);

  const fetchClientAndTickets = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get client data from clients collection
      const clientDoc = await getDocs(collection(db, "clients"));
      const clientData = clientDoc.docs
        .find((doc) => doc.id === user.uid)
        ?.data();

      if (clientData) {
        setClientName(clientData.clientName);
        setCompanyName(clientData.companyName);

        // Fetch all tickets for this client (removed orderBy to avoid index issues)
        const ticketsQuery = query(
          collection(db, "tickets"),
          where("clientId", "==", user.uid)
        );

        const ticketsSnapshot = await getDocs(ticketsQuery);
        const ticketsList = ticketsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Use utility function for safe sorting
        const sortedTickets = safeSortByDate(ticketsList, "createdAt", false);
        setTickets(sortedTickets);
      }
    } catch (error) {
      handleFirebaseError(error, "fetchClientAndTickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const projectsQuery = query(
        collection(db, "projects"),
        where("clientId", "==", user.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsList = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(projectsList);
    } catch (error) {
      // ignore
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;
      if (!newTicket.projectId) {
        alert("Please select a project for this ticket.");
        return;
      }
      const ticketData = {
        ...newTicket,
        clientId: user.uid,
        clientName: clientName,
        companyName: companyName,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: newTicket.projectId,
        projectName: newTicket.projectName,
      };
      await addDoc(collection(db, "tickets"), ticketData);
      // Reset form
      setNewTicket({
        subject: "",
        category: "",
        description: "",
        priority: "medium",
        projectId: "",
        projectName: "",
      });
      setShowForm(false);
      fetchClientAndTickets();
      alert("Ticket submitted successfully!");
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("Failed to submit ticket");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-700 border-red-200";
      case "in-progress":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "resolved":
      case "closed":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "in-progress":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Calculate statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in-progress"
  ).length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved").length;

  const stats = [
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: MessageSquare,
      color: "from-[#00B2E2] to-[#0091c2]",
      bgColor: "bg-[#e6f4fa] hover:bg-[#d1eef7]",
      textColor: "text-[#00B2E2]",
    },
    {
      label: "Open",
      value: openTickets,
      icon: AlertCircle,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 hover:bg-red-100",
      textColor: "text-red-600",
    },
    {
      label: "In Progress",
      value: inProgressTickets,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "Resolved/Closed",
      value: resolvedTickets,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Tickets</h2>
          {/* <p className="text-gray-600 mt-1">
            Submit and track your support requests
          </p> */}
        </div>
        <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl">
          {clientName} | {companyName}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`${stat.bgColor} rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={`text-3xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-200`}
                >
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raise New Ticket */}
      <Card className="border-0 shadow-lg ">
        <CardHeader className=" ">
          <div className="flex justify-between items-center">
            <CardTitle className="text-[#00B2E2]">Raise New Ticket</CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showForm ? "Cancel" : "New Ticket"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {showForm && (
            <form
              onSubmit={handleSubmitTicket}
              className="space-y-6 p-6 border border-gray-100 rounded-3xl bg-gray-50"
            >
              {/* Project selection */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Project
                </label>
                <select
                  value={newTicket.projectId}
                  onChange={(e) => {
                    const selected = projects.find(
                      (p) => p.id === e.target.value
                    );
                    setNewTicket((nt) => ({
                      ...nt,
                      projectId: e.target.value,
                      projectName: selected ? selected.name : "",
                    }));
                  }}
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00B2E2] focus:border-[#00B2E2] bg-white"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Subject
                </label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  placeholder="Enter issue title"
                  className="h-12 w-1/2 rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Category
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, category: e.target.value })
                    }
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00B2E2] focus:border-[#00B2E2] bg-white"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    <option value="bug">Bug / Error</option>
                    <option value="feature">Feature Request</option>
                    <option value="query">General Query</option>
                    <option value="billing">Billing Issue</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value })
                    }
                    className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00B2E2] focus:border-[#00B2E2] bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Description
                </label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, description: e.target.value })
                  }
                  placeholder="Describe your issue in detail..."
                  className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00B2E2] focus:border-[#00B2E2] resize-none bg-white"
                  rows="4"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Ticket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-2xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Your Tickets
        </h3>
        {tickets.length === 0 ? (
          <Card className="border-0 shadow-lg ">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#e6f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-[#00B2E2]" />
                </div>
                <p className="text-gray-500 text-lg">No tickets found.</p>
                <p className="text-gray-400 text-sm mt-1">
                  Create your first support ticket above.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardContent className="px-6 ">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-800">
                          {ticket.subject}
                        </h4>
                        <Badge
                          className={`${getStatusColor(ticket.status)} border`}
                        >
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">
                            {ticket.status === "resolved" ||
                            ticket.status === "closed"
                              ? "Resolved/Closed"
                              : ticket.status.charAt(0).toUpperCase() +
                                ticket.status.slice(1)}
                          </span>
                        </Badge>
                        <Badge
                          className={`${getPriorityColor(
                            ticket.priority
                          )} border`}
                        >
                          {ticket.priority} Priority
                        </Badge>
                      </div>
                      <div className="text-xs text-blue-700 font-semibold mb-1">
                        Project: {ticket.projectName || "N/A"}
                      </div>
                      <div className="text-xs text-purple-700 font-semibold mb-1">
                        Category: {ticket.category || "N/A"}
                      </div>
                      <p className="text-gray-600 mb-3">{ticket.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {ticket.createdAt?.toDate?.()?.toLocaleDateString() ||
                            new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
