"use client";

import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FinalDeliverablePdf from "./TimelinePdf";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

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

const RAZORPAY_KEY_ID = "rzp_test_C9vmBupw0OBO3c";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function handlePayment(row, fetchProjects) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  // You can customize amount, name, description, etc. as needed
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: (row.original.amount || 100) * 100, // Amount in paise (default 100 if not present)
    currency: "INR",
    name: "ProjectiaCore Project Payment",
    description: `Payment for project: ${row.original.name}`,
    handler: async function (response) {
      // Mark project as paid in Firestore
      try {
        await updateDoc(doc(db, "projects", row.original.id), {
          paymentStatus: "paid",
          paymentId: response.razorpay_payment_id,
        });
        alert("Payment successful!");
        fetchProjects();
      } catch (err) {
        alert("Payment succeeded but failed to update status in database.");
      }
    },
    prefill: {
      name: row.original.clientName || "",
      email: row.original.clientEmail || "",
    },
    theme: {
      color: "#1e396b",
    },
  };
  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    fetchProjects();
    loadRazorpayScript(); // Preload script
  }, []);

  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const clientDoc = await getDocs(collection(db, "clients"));
      const clientData = clientDoc.docs
        .find((doc) => doc.id === user.uid)
        ?.data();
      if (clientData) {
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort by createdAt descending
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
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Project Name",
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <Badge className={getStatusColor(info.getValue())}>
            {info.getValue()}
          </Badge>
        ),
      },
      {
        id: "download",
        header: "Download PDF",
        cell: ({ row }) =>
          row.original.status === "completed" ? (
            <div className="w-full flex justify-center">
              <FinalDeliverablePdf projectId={row.original.id} />
            </div>
          ) : (
            <Button variant="outline" size="sm" className="w-full" disabled>
              Download Final Deliverables
            </Button>
          ),
      },
      {
        id: "payment",
        header: "Payment",
        cell: ({ row }) => {
          const isPaid = row.original.paymentStatus === "paid";
          return (
            <Button
              variant={isPaid ? "secondary" : "outline"}
              size="sm"
              disabled={row.original.status !== "completed" || isPaid}
              className="w-full"
              onClick={() => handlePayment(row, fetchProjects)}
            >
              {isPaid ? "Paid" : "Pay Now"}
            </Button>
          );
        },
      },
    ],
    []
  );

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.name?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [projects, filter]);

  // Pagination
  const paginatedProjects = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, pageIndex]);

  // Table instance
  const table = useReactTable({
    data: paginatedProjects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Filtering and pagination handled manually above
  });

  const pageCount = Math.ceil(filteredProjects.length / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <Input
              placeholder="Filter by project name..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPageIndex(0);
              }}
              className="max-w-xs"
            />
            <div className="text-sm text-gray-500">
              Showing {filteredProjects.length} projects
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsPage;
