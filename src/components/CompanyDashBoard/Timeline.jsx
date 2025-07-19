"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  Target,
  Plus,
  FileText
} from 'lucide-react';

export default function Timeline() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newTimeline, setNewTimeline] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium"
  });

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

  const addTimeline = async (e) => {
    e.preventDefault();
    try {
      if (!selectedProject) return;

      const timelineData = {
        ...newTimeline,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        companyName: companyName,
        clientId: selectedProject.clientId,
        clientName: selectedProject.clientName,
        status: "pending",
        createdAt: new Date()
      };

      await addDoc(collection(db, "timelines"), timelineData);
      
      // Reset form
      setNewTimeline({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium"
      });
      setShowAddTimeline(false);
      setSelectedProject(null);
      
      alert("Timeline item added successfully!");
    } catch (error) {
      console.error("Error adding timeline:", error);
      alert("Failed to add timeline item");
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
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "in-progress").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const pendingProjects = projects.filter(p => p.status === "pending").length;

  const stats = [
    { 
      label: 'Total Projects', 
      value: totalProjects, 
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Active', 
      value: activeProjects, 
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-600'
    },
    { 
      label: 'Completed', 
      value: completedProjects, 
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Pending', 
      value: pendingProjects, 
      icon: FileText,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-600'
    },
  ];

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
        <div className="text-sm text-gray-600">
          Company: {companyName}
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
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className={`text-3xl font-bold ${stat.textColor} group-hover:scale-105 transition-transform duration-200`}>
                  {stat.value}
                </div>
                <div className="text-slate-600 font-medium">
                  {stat.label}
                </div>
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
              {showAddTimeline ? 'Cancel' : 'Add Timeline'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTimeline && (
            <div className="space-y-4">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Project</label>
                <select
                  value={selectedProject?.id || ""}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
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
                <form onSubmit={addTimeline} className="space-y-4 p-4 border rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeline Title</label>
                    <Input
                      value={newTimeline.title}
                      onChange={(e) => setNewTimeline({...newTimeline, title: e.target.value})}
                      placeholder="Enter timeline item title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newTimeline.description}
                      onChange={(e) => setNewTimeline({...newTimeline, description: e.target.value})}
                      placeholder="Describe the timeline item..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Due Date</label>
                      <Input
                        type="date"
                        value={newTimeline.dueDate}
                        onChange={(e) => setNewTimeline({...newTimeline, dueDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Priority</label>
                      <select
                        value={newTimeline.priority}
                        onChange={(e) => setNewTimeline({...newTimeline, priority: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
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
                          dueDate: "",
                          priority: "medium"
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
          {projects.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No projects found. Create projects first to add timeline items.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{project.name}</h4>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                    <div className="text-xs text-gray-500">
                      <div>Client: {project.clientName}</div>
                      <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                      <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}