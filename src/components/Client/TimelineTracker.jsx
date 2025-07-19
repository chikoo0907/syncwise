"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Add these imports for table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import FinalDeliverablePdf from "./TimelinePdf";
import TimelineActionDialog from "@/components/CompanyDashBoard/DeliverableDialog";

export default function TimelineTracker() {
  const [timelines, setTimelines] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  // Table columns for timeline items
  const handleTimelineUpdate = (timelineId, summary) => {
    setTimelines((prev) =>
      prev.map((tl) =>
        tl.id === timelineId ? { ...tl, timelineSummary: summary } : tl
      )
    );
  };
  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Timeline Title",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "projectName",
        header: "Project Name",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <span
            className={`capitalize px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              info.getValue()
            )}`}
          >
            {info.getValue() || "-"}
          </span>
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "-",
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: (info) =>
          info.getValue()
            ? new Date(info.getValue()).toLocaleDateString()
            : "-",
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <TimelineActionDialog
            timeline={row.original}
            onUpdate={handleTimelineUpdate}
            readOnly={true}
          />
        ),
      },
    ],
    []
  );
  // Table instance for filtered timelines
  const filteredTimelines = selectedProject
    ? timelines.filter((t) => t.projectId === selectedProject.id)
    : [];
  const table = useReactTable({
    data: filteredTimelines,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
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

        // Fetch all projects for this client (removed orderBy to avoid index issues)
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid)
        );

        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort locally instead of in query
        projectsList.sort((a, b) => {
          const dateA =
            a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB =
            b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });

        setProjects(projectsList);

        // Fetch all timeline items for this client's projects (removed orderBy to avoid index issues)
        const timelinesQuery = query(
          collection(db, "timelines"),
          where("clientId", "==", user.uid)
        );

        const timelinesSnapshot = await getDocs(timelinesQuery);
        const timelinesList = timelinesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort locally instead of in query
        timelinesList.sort((a, b) => {
          const dateA =
            a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB =
            b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });

        setTimelines(timelinesList);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "in-progress":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "completed":
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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
  const totalTimelines = timelines.length;
  const pendingTimelines = timelines.filter(
    (d) => d.status === "pending"
  ).length;
  const inProgressTimelines = timelines.filter(
    (d) => d.status === "in-progress"
  ).length;
  const completedTimelines = timelines.filter(
    (d) => d.status === "completed" || d.status === "delivered"
  ).length;

  const stats = [
    {
      label: "Total Timeline Items",
      value: totalTimelines,
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Pending",
      value: pendingTimelines,
      icon: Clock,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50 hover:bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "In Progress",
      value: inProgressTimelines,
      icon: AlertCircle,
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Completed",
      value: completedTimelines,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Timeline</h2>
        <div className="text-sm text-gray-600">
          Client: {clientName} | Company: {companyName}
        </div>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      </div> */}

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No projects found. Contact your company to get started!</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const project = projects.find(
                      (p) => p.id === e.target.value
                    );
                    setSelectedProject(project || null);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedProject && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card
                    key={selectedProject.id}
                    className={`hover:shadow-lg transition-shadow border-2 border-blue-400`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">
                          {selectedProject.name}
                        </h4>
                        <Badge
                          className={getStatusColor(selectedProject.status)}
                        >
                          {selectedProject.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {selectedProject.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <div>
                          Start:{" "}
                          {new Date(
                            selectedProject.startDate
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          End:{" "}
                          {new Date(
                            selectedProject.endDate
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Timeline Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline Items</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedProject === null ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Please select a project to view its timeline items.</p>
            </div>
          ) : filteredTimelines.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No timeline items found for this project.</p>
            </div>
          ) : (
            <>
              {/* PDF Download Button */}
              {selectedProject && selectedProject.status === "completed" && (
                <FinalDeliverablePdf
                  projectName={selectedProject.name}
                  timelineItems={filteredTimelines}
                />
              )}
              <div className="rounded-md border border-[#a3c5e0] bg-white overflow-x-auto">
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
