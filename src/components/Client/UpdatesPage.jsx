"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Calendar, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle,
  Info,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function UpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get client data from clients collection
      const clientDoc = await getDocs(collection(db, "clients"));
      const clientData = clientDoc.docs.find(doc => doc.id === user.uid)?.data();
      
      if (clientData) {
        setClientName(clientData.clientName);
        setCompanyName(clientData.companyName);
        
        // Fetch all projects for this client (removed orderBy to avoid index issues)
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid)
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
        
        // Generate updates based on project changes and status updates
        const projectUpdates = generateProjectUpdates(projectsList);
        setUpdates(projectUpdates);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const generateProjectUpdates = (projectsList) => {
    const updates = [];
    
    projectsList.forEach(project => {
      // Add project creation update
      updates.push({
        id: `project-${project.id}`,
        title: `New Project: ${project.name}`,
        date: project.createdAt?.toDate() || new Date(),
        description: `A new project "${project.name}" has been created for you. ${project.description}`,
        type: "project",
        status: "new",
        projectId: project.id
      });

      // Add status update if project was updated recently
      if (project.updatedAt && project.updatedAt !== project.createdAt) {
        updates.push({
          id: `update-${project.id}`,
          title: `Project Status Updated: ${project.name}`,
          date: project.updatedAt?.toDate() || new Date(),
          description: `The status of project "${project.name}" has been updated to "${project.status}".`,
          type: "status",
          status: project.status,
          projectId: project.id
        });
      }
    });

    // Add some sample updates for demonstration
    updates.push({
      id: "sample-1",
      title: "System Maintenance Notice",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      description: "Scheduled maintenance will occur on July 20th from 12:00 AM to 4:00 AM IST. Services may be temporarily unavailable.",
      type: "announcement",
      status: "info"
    });

    updates.push({
      id: "sample-2",
      title: "New Features Available",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      description: "We've added new features to improve your experience. Check out the latest updates in your dashboard.",
      type: "feature",
      status: "success"
    });

    // Sort by date (newest first)
    return updates.sort((a, b) => b.date - a.date);
  };

  const getUpdateIcon = (type, status) => {
    switch (type) {
      case "project":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "status":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "announcement":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "feature":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUpdateColor = (type, status) => {
    switch (type) {
      case "project":
        return "border-blue-500 bg-blue-50";
      case "status":
        return "border-yellow-500 bg-yellow-50";
      case "announcement":
        return "border-orange-500 bg-orange-50";
      case "feature":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate statistics
  const totalUpdates = updates.length;
  const recentUpdates = updates.filter(u => {
    const daysDiff = (new Date() - u.date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  }).length;
  const projectUpdates = updates.filter(u => u.type === "project").length;
  const announcements = updates.filter(u => u.type === "announcement").length;

  const stats = [
    { 
      label: 'Total Updates', 
      value: totalUpdates, 
      icon: Bell,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Recent (7 days)', 
      value: recentUpdates, 
      icon: Clock,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50 hover:bg-green-100',
      textColor: 'text-green-600'
    },
    { 
      label: 'Projects', 
      value: projectUpdates, 
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-600'
    },
    { 
      label: 'Announcements', 
      value: announcements, 
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading updates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Project Updates</h2>
        <div className="text-sm text-gray-600">
          Client: {clientName} | Company: {companyName}
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

      {/* Updates List */}
      <Card>
        <CardHeader>
          <CardTitle>Latest Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No updates found. Updates will appear here as your projects progress.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updates.map((update) => (
                <Card key={update.id} className={`hover:shadow-lg transition-shadow ${getUpdateColor(update.type, update.status)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getUpdateIcon(update.type, update.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{update.title}</h3>
                          <Badge className={getStatusColor(update.status)}>
                            {update.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{update.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{update.date.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span className="capitalize">{update.type}</span>
                          </div>
                        </div>
                      </div>
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
