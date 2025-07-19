"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, Target, Plus, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";
import TimelineActionDialog from "@/components/CompanyDashBoard/DeliverableDialog";

export default function Timeline() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTimeline, setNewTimeline] = useState({
    title: "",
    description: "",
    startDate: "",
    dueDate: "",
  });
  const [projectFilter, setProjectFilter] = useState("");
  const [timelines, setTimelines] = useState([]);

  useEffect(() => {
    fetchCompanyAndTimelines();
    fetchProjectsForDropdown();
  }, []);

  const fetchCompanyAndTimelines = async () => {
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

        // Fetch all timeline items for this company
        const timelinesQuery = query(
          collection(db, "timelines"),
          where("companyName", "==", companyData.companyName)
        );

        const timelinesSnapshot = await getDocs(timelinesQuery);
        const timelinesList = timelinesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt descending
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
      console.error("Error fetching timelines:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for dropdown only
  const fetchProjectsForDropdown = async () => {
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
      console.error("Error fetching projects for dropdown:", error);
    }
  };

  const addTimeline = async (e) => {
    e.preventDefault();
    try {
      if (!selectedProject) return;

      const timelineData = {
        title: newTimeline.title,
        description: newTimeline.description,
        startDate: newTimeline.startDate,
        dueDate: newTimeline.dueDate,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        companyName: companyName,
        clientId: selectedProject.clientId,
        clientName: selectedProject.clientName,
        status: "pending",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "timelines"), timelineData);

      // Reset form
      setNewTimeline({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
      });
      setShowAddTimeline(false);
      setSelectedProject(null);

      alert("Timeline item added successfully!");
    } catch (error) {
      console.error("Error adding timeline:", error);
      alert("Failed to add timeline item");
    }
  };

  // Update timeline status
  const updateTimelineStatus = async (timelineId, newStatus) => {
    try {
      await updateDoc(doc(db, "timelines", timelineId), {
        status: newStatus,
      });

      setTimelines((timelines) =>
        timelines.map((tl) =>
          tl.id === timelineId ? { ...tl, status: newStatus } : tl
        )
      );
    } catch (error) {
      console.error("Error updating timeline status:", error);
      alert("Failed to update status");
    }
  };

  // Handle timeline summary update
  const handleTimelineUpdate = (timelineId, summary) => {
    setTimelines((prev) =>
      prev.map((tl) =>
        tl.id === timelineId ? { ...tl, timelineSummary: summary } : tl
      )
    );
  };

  // Replace getPriorityColor with getStatusColor
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#e0eef5] text-[#1e396b]";
      case "in-progress":
        return "bg-[#496c9c] text-[#ffffff]";
      case "completed":
        return "bg-[#1e396b] text-[#e0eef5]";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === "in-progress"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingProjects = projects.filter((p) => p.status === "pending").length;

  const stats = [
    {
      label: "Total Projects",
      value: totalProjects,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Active",
      value: activeProjects,
      icon: Clock,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 hover:bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Completed",
      value: completedProjects,
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 hover:bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      label: "Pending",
      value: pendingProjects,
      icon: FileText,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 hover:bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  // Table columns definition for Your Projects (now timeline items)
  const columns = useMemo(
    () => [
      {
        accessorKey: "projectName",
        header: "Project Name",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "title",
        header: "Timeline Title",
        cell: (info) => info.getValue() || "-",
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
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <TimelineActionDialog
            timeline={row.original}
            onUpdate={handleTimelineUpdate}
          />
        ),
      },
      {
        id: "updateStatus",
        header: "Update Status",
        cell: ({ row }) => (
          <select
            value={row.original.status || "pending"}
            onChange={(e) =>
              updateTimelineStatus(row.original.id, e.target.value)
            }
            className="p-2 border border-gray-300 rounded text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        ),
      },
    ],
    []
  );

  // Table instance
  const table = useReactTable({
    data: timelines,
    columns,
    state: {
      globalFilter: projectFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setProjectFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      // Filter by project name
      const project = row.original.projectName?.toLowerCase() || "";
      return project.includes(filterValue.toLowerCase());
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Timeline</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Company: {companyName}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimelines([]);
              setProjects([]);
              fetchCompanyAndTimelines();
              fetchProjectsForDropdown();
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

      {/* Add Timeline Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Timeline Item</CardTitle>
            <Button
              onClick={() => setShowAddTimeline(!showAddTimeline)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showAddTimeline ? "Cancel" : "Add Timeline"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTimeline && (
            <div className="space-y-4">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const project = projects.find(
                      (p) => p.id === e.target.value
                    );
                    setSelectedProject(project);
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Select a Project --</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject && (
                <form
                  onSubmit={addTimeline}
                  className="space-y-4 p-4 border rounded-lg"
                >
                  {selectedProject.status === "completed" && (
                    <div className="text-red-600 font-semibold mb-2">
                      Timeline cannot be added for a completed project.
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Timeline Title
                    </label>
                    <Input
                      value={newTimeline.title}
                      onChange={(e) =>
                        setNewTimeline({
                          ...newTimeline,
                          title: e.target.value,
                        })
                      }
                      placeholder="Enter timeline item title"
                      required
                      disabled={selectedProject.status === "completed"}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newTimeline.description}
                      onChange={(e) =>
                        setNewTimeline({
                          ...newTimeline,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the timeline item..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      required
                      disabled={selectedProject.status === "completed"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={newTimeline.startDate}
                        onChange={(e) =>
                          setNewTimeline({
                            ...newTimeline,
                            startDate: e.target.value,
                          })
                        }
                        required
                        disabled={selectedProject.status === "completed"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        value={newTimeline.dueDate}
                        onChange={(e) =>
                          setNewTimeline({
                            ...newTimeline,
                            dueDate: e.target.value,
                          })
                        }
                        required
                        disabled={selectedProject.status === "completed"}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={selectedProject.status === "completed"}
                    >
                      Add Timeline Item
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddTimeline(false);
                        setSelectedProject(null);
                        setNewTimeline({
                          title: "",
                          description: "",
                          startDate: "",
                          dueDate: "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {timelines.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No timeline items found. Create one above.</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Input
                  placeholder="Filter by project name..."
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="max-w-xs"
                />
                <div className="text-sm text-gray-500">
                  Showing {table.getFilteredRowModel().rows.length} of{" "}
                  {timelines.length} timeline items
                </div>
              </div>

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

              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
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
