"use client";

import React, { useState, useEffect } from "react";
import { auth, realtimeDb, db, testRealtimeConnection } from "@/firebase";
import { ref, push, onValue, off, update } from "firebase/database";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  User,
  Calendar,
  Building,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function ClientCompanyChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");
  const [useFirestore, setUseFirestore] = useState(false);

  useEffect(() => {
    fetchClientData();
    testConnection();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setupMessageListener(user.uid);
    }

    return () => {
      if (user) {
        off(ref(realtimeDb, `chats/${user.uid}`));
      }
    };
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
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Don't throw error, just log it
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setConnectionStatus("Testing connection...");
    try {
      const isConnected = await testRealtimeConnection();
      if (isConnected) {
        setConnectionStatus("Connected (Realtime)");
        setUseFirestore(false);
      } else {
        setConnectionStatus("Realtime failed, using Firestore");
        setUseFirestore(true);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      if (error.code === "PERMISSION_DENIED") {
        setConnectionStatus("Permission denied - using Firestore");
        setUseFirestore(true);
        // Show alert with instructions
        alert(
          "Firebase Realtime Database permission denied. Please update your database rules. Using Firestore as fallback."
        );
      } else {
        setConnectionStatus("Connection failed");
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
        async (snapshot) => {
          try {
            const data = snapshot.val();
            if (data) {
              const messagesList = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));

              // Sort by timestamp
              messagesList.sort((a, b) => a.timestamp - b.timestamp);

              setMessages(messagesList);

              // Mark all unread company messages as read
              const updates = [];
              Object.keys(data).forEach((key) => {
                const msg = data[key];
                if (msg.sender === "company" && !msg.read) {
                  updates.push(
                    update(ref(realtimeDb, `chats/${clientId}/${key}`), {
                      read: true,
                    })
                  );
                }
              });
              if (updates.length > 0) {
                await Promise.all(updates);
              }

              // Count unread messages (should now be 0 after marking as read)
              const unread = messagesList.filter(
                (msg) => msg.sender === "company" && !msg.read
              ).length;
              setUnreadCount(unread);
            } else {
              // Initialize with welcome message if no messages exist
              setMessages([
                {
                  id: "welcome",
                  text: "Welcome to SyncWise! How can we help you today?",
                  sender: "company",
                  timestamp: Date.now(),
                  time: new Date().toLocaleTimeString(),
                  read: true,
                },
              ]);
              setUnreadCount(0);
            }
            setConnectionStatus("Connected (Realtime)");
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
    setConnectionStatus("Connected (Firestore)");

    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("clientId", "==", clientId)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
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

        setMessages(messagesList);

        // Mark all unread company messages as read
        const unreadDocs = snapshot.docs.filter(
          (doc) => doc.data().sender === "company" && !doc.data().read
        );
        const updates = [];
        for (const docSnap of unreadDocs) {
          updates.push(updateDoc(docSnap.ref, { read: true }));
        }
        if (updates.length > 0) {
          await Promise.all(updates);
        }

        // Count unread messages (should now be 0 after marking as read)
        const unread = messagesList.filter(
          (msg) => msg.sender === "company" && !msg.read
        ).length;
        setUnreadCount(unread);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setConnectionStatus("Connection Failed");
      setMessages([]);
      setUnreadCount(0);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const newMessage = {
        text: input.trim(),
        sender: "client",
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString(),
        read: false,
      };

      if (useFirestore) {
        // Use Firestore as fallback
        await addDoc(collection(db, "messages"), {
          clientId: user.uid,
          clientName: clientName,
          companyName: companyName,
          message: input.trim(),
          sender: "client",
          createdAt: new Date(),
          read: false,
        });
      } else {
        // Use Realtime Database
        const messagesRef = ref(realtimeDb, `chats/${user.uid}`);
        await push(messagesRef, newMessage);
      }
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      // Add message to local state as fallback
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: input.trim(),
          sender: "client",
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString(),
          read: false,
        },
      ]);
      setInput("");
      alert("Message sent locally (database connection issue)");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

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
            Chat with Company
          </h2>
          {/* <p className="text-gray-600 mt-1">
            Communicate directly with your service provider
          </p> */}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-2xl">
            {clientName} | {companyName}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={`${
                connectionStatus.includes("Connected")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              } border`}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              {connectionStatus}
            </Badge>
            {connectionStatus.includes("failed") && (
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

      {/* Chat Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#e6f4fa] rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-[#00B2E2] to-[#0091c2] shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-[#00B2E2] group-hover:scale-105 transition-transform duration-200">
              {messages.length}
            </div>
            <div className="text-gray-600 font-medium">
              Total Messages
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-red-600 group-hover:scale-105 transition-transform duration-200">
              {unreadCount}
            </div>
            <div className="text-gray-600 font-medium">
              Unread Messages
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-3xl p-6 border border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600 group-hover:scale-105 transition-transform duration-200 truncate">
              {companyName}
            </div>
            <div className="text-gray-600 font-medium">
              Your Company
            </div>
          </div>
        </div>
      </div> */}

      {/* Chat Interface */}
      <Card className="h-[500px] flex flex-col border-0 shadow-lg ">
        <CardHeader className="border-b border-gray-100 ">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#00B2E2]">
              Chat with {companyName}
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white border-0">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[300px] bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="w-16 h-16 bg-[#e6f4fa] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-[#00B2E2]" />
                </div>
                <p className="text-gray-600 font-medium">No messages yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Start a conversation with your company!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`flex ${
                      message.sender === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        message.sender === "client"
                          ? "bg-[#00B2E2] text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium">
                          {message.sender === "client" ? "You" : companyName}
                        </span>
                        <span
                          className={`text-xs ${
                            message.sender === "client"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-6 bg-white">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-2xl border-gray-200 focus:border-[#00B2E2] focus:ring-[#00B2E2]"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-[#00B2E2] hover:bg-[#0091c2] text-white px-6 py-2 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
