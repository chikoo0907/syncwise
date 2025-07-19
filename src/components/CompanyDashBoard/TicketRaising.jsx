"use client";

import React, { useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function TicketRaising() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchProjects();
  }, []);

  const fetchTickets = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get company name from companies collection
      const companyDoc = await getDocs(collection(db, "companies"));
      const companyData = companyDoc.docs
        .find((doc) => doc.id === user.uid)
        ?.data();

      if (companyData) {
        setCompanyName(companyData.companyName);

        // Fetch all tickets for this company (removed orderBy to avoid index issues)
        const ticketsQuery = query(
          collection(db, "tickets"),
          where("companyName", "==", companyData.companyName)
        );

        const ticketsSnapshot = await getDocs(ticketsQuery);
        const ticketsList = ticketsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort locally instead of in query
        ticketsList.sort((a, b) => {
          const dateA =
            a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB =
            b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });

        setTickets(ticketsList);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const companyDoc = await getDocs(collection(db, "companies"));
      const companyData = companyDoc.docs
        .find((doc) => doc.id === user.uid)
        ?.data();
      if (companyData) {
        const projectsQuery = query(
          collection(db, "projects"),
          where("companyName", "==", companyData.companyName)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsList);
      }
    } catch (error) {
      // ignore
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setTickets(
        tickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: newStatus, updatedAt: new Date() }
            : ticket
        )
      );

      alert("Ticket status updated successfully!");
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert("Failed to update ticket status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in-progress"
  ).length;
  const resolvedTickets = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  const stats = [
    {
      label: "Total Tickets",
      value: totalTickets,
      icon: MessageSquare,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
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

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "resolved_closed"
        ? ticket.status === "resolved" || ticket.status === "closed"
        : ticket.status === statusFilter);
    const matchesProject =
      projectFilter === "all" || ticket.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;
  const pageCount = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, pageIndex]);

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "subject",
        header: "Title",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => info.getValue() || "-",
      },

      {
        accessorKey: "clientName",
        header: "Client Name",
        cell: (info) => info.getValue() || "-",
      },

      {
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
            {row.original.category || "No Category"}
          </Badge>
        ),
      },
      {
        id: "priority",
        header: "Priority",
        cell: ({ row }) => (
          <Badge className={getPriorityColor(row.original.priority)}>
            {row.original.priority}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium border ${getStatusColor(
              row.original.status
            )}`}
          >
            {/* {getStatusIcon(row.original.status)} */}
            <span className="ml-1 capitalize">
              {row.original.status === "resolved" ||
              row.original.status === "closed"
                ? "Resolved/Closed"
                : row.original.status.charAt(0).toUpperCase() +
                  row.original.status.slice(1)}
            </span>
          </span>
        ),
      },
      {
        id: "updateStatus",
        header: "Update Status",
        cell: ({ row }) => (
          <select
            value={
              row.original.status === "resolved" ||
              row.original.status === "closed"
                ? "resolved_closed"
                : row.original.status
            }
            onChange={(e) => {
              const val = e.target.value;
              updateTicketStatus(
                row.original.id,
                val === "resolved_closed" ? "resolved" : val
              );
            }}
            className="p-2 border border-gray-300 rounded text-sm"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved_closed">Resolved/Closed</option>
          </select>
        ),
      },
    ],
    [tickets]
  );

  const table = useReactTable({
    data: paginatedTickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Ticket Management</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Company: {companyName}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setTickets([]);
              fetchTickets();
            }}
            className="ml-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`${stat.bgColor} backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
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
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved_closed">Resolved/Closed</option>
            </select>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tickets found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-[#a3c5e0] bg-white">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="text-center">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="text-center">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                  disabled={pageIndex === 0}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {pageIndex + 1} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPageIndex((p) => Math.min(pageCount - 1, p + 1))
                  }
                  disabled={pageIndex >= pageCount - 1}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
