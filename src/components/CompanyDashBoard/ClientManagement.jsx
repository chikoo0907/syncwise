"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function ClientManagement() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "pending",
  });
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    fetchCompanyAndClients();
  }, []);

  const fetchCompanyAndClients = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get company name from companies collection
      const companyDoc = await getDoc(doc(db, "companies", user.uid));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        setCompanyName(companyData.companyName);

        // Fetch clients that belong to this company (removed orderBy to avoid index issues)
        const clientsQuery = query(
          collection(db, "clients"),
          where("companyName", "==", companyData.companyName)
        );

        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort locally instead of in query
        clientsList.sort((a, b) => {
          const dateA =
            a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB =
            b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        });

        setClients(clientsList);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        clientId: selectedClient.id,
        clientName: selectedClient.clientName,
        companyName: companyName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, "projects"), projectData);

      // Reset form
      setNewProject({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "pending",
      });
      setShowAddProject(false);

      alert("Project added successfully!");
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project");
    }
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "clientName",
        header: "Client Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Client Email",
        cell: (info) => info.getValue(),
      },
      {
        id: "addProject",
        header: "Add Project",
        cell: ({ row }) => (
          <Button
            className="bg-[#496c9c] hover:bg-[#0091c2] text-white px-4 py-1 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => {
              setSelectedClient(row.original);
              setShowAddProject(true);
            }}
          >
            Add Project
          </Button>
        ),
      },
    ],
    []
  );

  // Table instance
  const table = useReactTable({
    data: clients,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      // Filter by clientName or email
      const name = row.original.clientName?.toLowerCase() || "";
      const email = row.original.email?.toLowerCase() || "";
      return (
        name.includes(filterValue.toLowerCase()) ||
        email.includes(filterValue.toLowerCase())
      );
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Client Management
          </h2>
          {/* <p className="text-gray-600 mt-1">
            Manage your client relationships and projects
          </p> */}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl">
            Company: {companyName}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setClients([]);
              fetchCompanyAndClients();
            }}
            className="ml-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      {!selectedClient ? (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Your Clients
          </h3>
          {clients.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#e6f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#00B2E2] text-2xl">👥</span>
                  </div>
                  <p className="text-gray-500 text-lg">
                    No clients found for your company.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Clients will appear here once they sign up.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Input
                  placeholder="Filter clients by name or email..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="max-w-xs"
                />
                <div className="text-sm text-gray-500">
                  Showing {table.getFilteredRowModel().rows.length} of{" "}
                  {clients.length} clients
                </div>
              </div>
              <div className="rounded-md border border-[#a3c5e0] bg-white overflow-x-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={
                              header.column.id === "addProject"
                                ? "text-center w-[20%]"
                                : "w-[40%]"
                            }
                          >
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
                            <TableCell
                              key={cell.id}
                              className={
                                cell.column.id === "addProject"
                                  ? "text-center"
                                  : ""
                              }
                            >
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
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-[#00B2E2] hover:text-[#0091c2] mb-2 flex items-center gap-2 transition-colors"
              >
                ← Back to Clients
              </button>
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedClient.clientName}
              </h3>
              <p className="text-gray-600">{selectedClient.email}</p>
            </div>
            <Button
              onClick={() => setShowAddProject(true)}
              className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Add Project
            </Button>
          </div>

          {showAddProject && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader className="">
                <CardTitle className="text-[#00B2E2]">
                  Add New Project
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Project Name
                    </label>
                    <Input
                      value={newProject.name}
                      onChange={(e) =>
                        setNewProject({ ...newProject, name: e.target.value })
                      }
                      placeholder="Enter project name"
                      className="rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter project description"
                      className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00B2E2] focus:border-[#00B2E2] resize-none"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={newProject.startDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            startDate: e.target.value,
                          })
                        }
                        className="rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={newProject.endDate}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            endDate: e.target.value,
                          })
                        }
                        className="rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddProject(false)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-2xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
