"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import DeliverableDialog from "./DeliverableDialog";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [linkInputs, setLinkInputs] = useState({});
  const [savingLink, setSavingLink] = useState({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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

        // Fetch all projects for this company (removed orderBy to avoid index issues)
        const projectsQuery = query(
          collection(db, "projects"),
          where("companyName", "==", companyData.companyName)
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
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      await updateDoc(doc(db, "projects", projectId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      setProjects(
        projects.map((project) =>
          project.id === projectId
            ? { ...project, status: newStatus, updatedAt: new Date() }
            : project
        )
      );

      alert("Project status updated successfully!");
    } catch (error) {
      console.error("Error updating project status:", error);
      alert("Failed to update project status");
    }
  };

  const deleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, "projects", projectId));

        // Update local state
        setProjects(projects.filter((project) => project.id !== projectId));

        alert("Project deleted successfully!");
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project");
      }
    }
  };

  const saveFinalLink = async (projectId, link) => {
    setSavingLink((prev) => ({ ...prev, [projectId]: true }));
    try {
      await updateDoc(doc(db, "projects", projectId), { finalLink: link });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, finalLink: link } : p))
      );
      alert("Link saved!");
    } catch (e) {
      alert("Failed to save link");
    } finally {
      setSavingLink((prev) => ({ ...prev, [projectId]: false }));
    }
  };

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

  const filteredProjects =
    filterStatus === "all"
      ? projects
      : projects.filter((project) => project.status === filterStatus);

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "clientName",
        header: "Client Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "name",
        header: "Project Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Current Status",
        cell: (info) => (
          <span
            className={
              getStatusColor(info.getValue()) +
              " px-2 py-1 rounded text-xs font-medium"
            }
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <DeliverableDialog
            timeline={row.original}
            onUpdate={(projectId, summary) => {
              setProjects((prev) =>
                prev.map((p) =>
                  p.id === projectId ? { ...p, projectSummary: summary } : p
                )
              );
            }}
          />
        ),
      },
      {
        id: "updateStatus",
        header: "Update Status",
        cell: ({ row }) => (
          <select
            value={row.original.status}
            onChange={(e) =>
              updateProjectStatus(row.original.id, e.target.value)
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
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteProject(row.original.id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </Button>
        ),
      },
    ],
    [projects]
  );

  // Table instance
  const table = useReactTable({
    data: filteredProjects,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      // Filter by clientName or project name
      const client = row.original.clientName?.toLowerCase() || "";
      const project = row.original.name?.toLowerCase() || "";
      return (
        client.includes(filterValue.toLowerCase()) ||
        project.includes(filterValue.toLowerCase())
      );
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
        <h2 className="text-2xl font-bold text-gray-800">Manage Projects</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Company: {companyName}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setProjects([]);
              fetchProjects();
            }}
            className="ml-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Input
          placeholder="Filter by client or project name..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="text-sm text-gray-500">
          Showing {table.getFilteredRowModel().rows.length} of{" "}
          {filteredProjects.length} projects
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
    </div>
  );
}
