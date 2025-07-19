"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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
      const companyData = companyDoc.docs.find(doc => doc.id === user.uid)?.data();
      
      if (companyData) {
        setCompanyName(companyData.companyName);
        
        // Fetch all projects for this company (removed orderBy to avoid index issues)
        const projectsQuery = query(
          collection(db, "projects"),
          where("companyName", "==", companyData.companyName)
        );
        
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort locally instead of in query
        projectsList.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
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
        updatedAt: new Date()
      });
      
      // Update local state
      setProjects(projects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus, updatedAt: new Date() }
          : project
      ));
      
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
        setProjects(projects.filter(project => project.id !== projectId));
        
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
      setProjects((prev) => prev.map(p => p.id === projectId ? { ...p, finalLink: link } : p));
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
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = filterStatus === "all" 
    ? projects 
    : projects.filter(project => project.status === filterStatus);

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
        <div className="text-sm text-gray-600">
          Company: {companyName}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          onClick={() => setFilterStatus("all")}
        >
          All ({projects.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
        >
          Pending ({projects.filter(p => p.status === "pending").length})
        </Button>
        <Button
          variant={filterStatus === "in-progress" ? "default" : "outline"}
          onClick={() => setFilterStatus("in-progress")}
        >
          In Progress ({projects.filter(p => p.status === "in-progress").length})
        </Button>
        <Button
          variant={filterStatus === "completed" ? "default" : "outline"}
          onClick={() => setFilterStatus("completed")}
        >
          Completed ({projects.filter(p => p.status === "completed").length})
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500 text-center">
              {filterStatus === "all" 
                ? "No projects found for your company." 
                : `No ${filterStatus} projects found.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm mb-2">Description:</p>
                  <p className="text-gray-800">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Client:</p>
                    <p className="font-medium">{project.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Start Date:</p>
                    <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date:</p>
                    <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created:</p>
                    <p className="font-medium">{project.createdAt?.toDate().toLocaleDateString()}</p>
                  </div>
                </div>
                {/* Final Link input for completed projects */}
                {project.status === 'completed' && (
                  <div className="pt-2 border-t mt-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Final URL/Drive Link:</label>
                    <input
                      type="url"
                      className="w-full p-2 border border-gray-300 rounded mb-2"
                      placeholder="https://drive.google.com/..."
                      value={linkInputs[project.id] !== undefined ? linkInputs[project.id] : (project.finalLink || '')}
                      onChange={e => setLinkInputs(inputs => ({ ...inputs, [project.id]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      className="bg-[#00B2E2] text-white rounded"
                      disabled={savingLink[project.id]}
                      onClick={() => saveFinalLink(project.id, linkInputs[project.id] || project.finalLink || '')}
                    >
                      {savingLink[project.id] ? 'Saving...' : 'Save Link'}
                    </Button>
                    {project.finalLink && (
                      <div className="mt-2 text-xs text-blue-700">
                        Current Link: <a href={project.finalLink} target="_blank" rel="noopener noreferrer" className="underline">{project.finalLink}</a>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex gap-2 pt-4 border-t">
                  <select
                    value={project.status}
                    onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
