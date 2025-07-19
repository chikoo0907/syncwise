"use client";

import React, { useState, useEffect } from "react";
import { auth, realtimeDb, db, testRealtimeConnection } from "@/firebase";
import { ref, push, onValue, off, set } from "firebase/database";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  User,
  Search,
  Building,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function Chat() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [dbConnectionStatus, setDbConnectionStatus] = useState("Connecting...");
  const [useFirestore, setUseFirestore] = useState(false);

  useEffect(() => {
    fetchClients();
    testConnection();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setupMessageListener(selectedClient.id);
    }
    return () => {
      if (selectedClient) {
        off(ref(realtimeDb, `chats/${selectedClient.id}`));
      }
    };
  }, [selectedClient]);

  const fetchClients = async () => {
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

        // Fetch all clients for this company (removed orderBy to avoid index issues)
        const clientsQuery = query(
          collection(db, "clients"),
          where("companyName", "==", companyData.companyName)
        );

        const clientsSnapshot = await getDocs(clientsQuery);
        const clientsList = clientsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().clientName,
          email: doc.data().email,
          avatar: doc.data().clientName?.charAt(0)?.toUpperCase() || "C",
          status: "active", // Default status
          lastMessage: "No messages yet",
          lastMessageTime: "Never",
          unread: 0,
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

        // Initialize messages for each client
        const initialMessages = {};
        clientsList.forEach((client) => {
          initialMessages[client.id] = [
            {
              id: 1,
              text: "Welcome to SyncWise! How can we help you today?",
              sender: "company",
              time: "Just now",
              read: true,
            },
          ];
        });
        setMessages(initialMessages);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setDbConnectionStatus("Testing connection...");
    try {
      const isConnected = await testRealtimeConnection();
      if (isConnected) {
        setDbConnectionStatus("Connected (Realtime)");
        setUseFirestore(false);
      } else {
        setDbConnectionStatus("Realtime failed, using Firestore");
        setUseFirestore(true);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      if (error.code === "PERMISSION_DENIED") {
        setDbConnectionStatus("Permission denied - using Firestore");
        setUseFirestore(true);
        // Show alert with instructions
        alert(
          "Firebase Realtime Database permission denied. Please update your database rules. Using Firestore as fallback."
        );
      } else {
        setDbConnectionStatus("Connection failed");
        setUseFirestore(true);
      }
    }
  };

  const retryConnection = () => {
    testConnection();
  };

  const setupMessageListener = (clientId) => {
    // Try Realtime Database first
    try {
      const messagesRef = ref(realtimeDb, `chats/${clientId}`);

      onValue(
        messagesRef,
        (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const messagesList = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));

              // Sort by timestamp
              messagesList.sort((a, b) => a.timestamp - b.timestamp);

              setMessages((prev) => ({
                ...prev,
                [clientId]: messagesList,
              }));
            } else {
              // Initialize with welcome message if no messages exist
              setMessages((prev) => ({
                ...prev,
                [clientId]: [
                  {
                    id: "welcome",
                    text: "Welcome to SyncWise! How can we help you today?",
                    sender: "company",
                    timestamp: Date.now(),
                    time: new Date().toLocaleTimeString(),
                    read: true,
                  },
                ],
              }));
            }
            setDbConnectionStatus("Connected (Realtime)");
          } catch (error) {
            console.error("Error processing messages:", error);
            fallbackToFirestore(clientId);
          }
        },
        (error) => {
          console.error("Error listening to messages:", error);
          fallbackToFirestore(clientId);
        }
      );
    } catch (error) {
      console.error("Error setting up message listener:", error);
      fallbackToFirestore(clientId);
    }
  };

  const fallbackToFirestore = (clientId) => {
    console.log("Falling back to Firestore for chat");
    setUseFirestore(true);
    setDbConnectionStatus("Connected (Firestore)");

    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("clientId", "==", clientId)
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          text: doc.data().message,
          sender: doc.data().sender,
          timestamp:
            doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
          time: new Date(
            doc.data().createdAt?.toDate?.() || doc.data().createdAt
          ).toLocaleTimeString(),
          read: doc.data().read || false,
        }));

        // Sort by timestamp
        messagesList.sort((a, b) => a.timestamp - b.timestamp);

        setMessages((prev) => ({
          ...prev,
          [clientId]: messagesList,
        }));
      });

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setDbConnectionStatus("Connection Failed");
      setMessages((prev) => ({
        ...prev,
        [clientId]: [],
      }));
    }
  };

  const handleSendMessage = async () => {
    if (messageText.trim() && selectedClient) {
      const newMessage = {
        text: messageText.trim(),
        sender: "company",
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString(),
        read: false,
      };

      try {
        if (useFirestore) {
          // Use Firestore as fallback
          await addDoc(collection(db, "messages"), {
            clientId: selectedClient.id,
            clientName: selectedClient.name,
            companyName: companyName,
            message: messageText.trim(),
            sender: "company",
            createdAt: new Date(),
            read: false,
          });
        } else {
          // Use Realtime Database
          const messagesRef = ref(realtimeDb, `chats/${selectedClient.id}`);
          await push(messagesRef, newMessage);
        }
        setMessageText("");
      } catch (error) {
        console.error("Error sending message:", error);
        // Add message to local state as fallback
        setMessages((prev) => ({
          ...prev,
          [selectedClient.id]: [...(prev[selectedClient.id] || []), newMessage],
        }));
        setMessageText("");
        alert("Message sent locally (database connection issue)");
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClientMessages = selectedClient
    ? messages[selectedClient.id] || []
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Client Communication
          </h2>
          {/* <p className="text-gray-600 mt-1">
            Chat with your clients in real-time
          </p> */}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl">
            Company: {companyName}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                dbConnectionStatus.includes("Connected")
                  ? "bg-[#d2e8f4] text-[#1e396b] border-[#a3c5e0]"
                  : "bg-red-50 text-red-700 border-red-200"
              } border`}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              {dbConnectionStatus}
            </Badge>
            {dbConnectionStatus.includes("failed") && (
              <Button
                onClick={retryConnection}
                size="sm"
                variant="outline"
                className="h-6 px-2 border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3  ">
        {/* Client List */}
        <Card className="lg:col-span-1 border-0  rounded-none">
          <CardHeader className=" ">
            <CardTitle className="text-[#00B2E2]">Clients</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-96 overflow-y-auto p-4">
              {filteredClients.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-16 h-16 bg-[#e6f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-[#00B2E2]" />
                  </div>
                  <p className="text-gray-500">No clients found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Clients will appear here once they sign up
                  </p>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={`px-4 py-2 rounded-2xl cursor-pointer transition-all duration-200 gap-5 ${
                      selectedClient?.id === client.id
                        ? "bg-[#00B2E2] text-white shadow-lg"
                        : "hover:bg-[#e6f4fa] hover:text-[#00B2E2]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          selectedClient?.id === client.id
                            ? "bg-white text-[#00B2E2]"
                            : "bg-[#e6f4fa] text-[#00B2E2]"
                        }`}
                      >
                        {client.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold truncate ${
                            selectedClient?.id === client.id
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {client.name}
                        </h4>
                        <p
                          className={`text-sm truncate ${
                            selectedClient?.id === client.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {client.email}
                        </p>
                        <p
                          className={`text-xs ${
                            selectedClient?.id === client.id
                              ? "text-blue-100"
                              : "text-gray-400"
                          }`}
                        >
                          {client.lastMessage}
                        </p>
                      </div>
                      {/* <Badge
                        className={
                          client.status === "active"
                            ? selectedClient?.id === client.id
                              ? "bg-white text-[#00B2E2]"
                              : "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {client.status}
                      </Badge> */}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 h-[600px] flex flex-col border-0 rounded-none  ">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-[#00B2E2]">
              {selectedClient
                ? `Chat with ${selectedClient.name}`
                : "Select a client to start chatting"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            {selectedClient ? (
              <>
                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[400px] bg-gray-100">
                  <div className="space-y-4">
                    {selectedClientMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "company"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                            message.sender === "company"
                              ? "bg-[#00B2E2] text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium">
                              {message.sender === "company"
                                ? companyName
                                : selectedClient.name}
                            </span>
                            <span
                              className={`text-xs ${
                                message.sender === "company"
                                  ? "text-blue-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {message.time}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-100 p-6 bg-white">
                  <div className="flex gap-3">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={handleKeyPress}
                      className="flex-1 rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-[#e6f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-[#00B2E2]" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    Select a client from the list
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    to start chatting
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
