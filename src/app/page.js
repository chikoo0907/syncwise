"use client";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <div className="h-[100vh] flex flex-col bg-white text-gray-800">
      <Head>
        <title>ProManage - IT Project Management</title>
      </Head>

      {/* Header/Navbar */}
      <header className="bg-gray-900 text-white py-4 relative z-10">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center">  
          <img src="/logo.png" alt="SyncWise Logo" className="h-15 w-auto mr-3" />
          <h1 className="text-2xl font-bold">SyncWise</h1>
          </div>
          <nav className="space-x-4 hidden md:block"></nav>
          {!isLoggedIn ? (
            <div className="space-x-2">
              <Link href="/login">
                <button className="bg-[#00B2E2] hover:bg-[#496c9c] px-4 py-2 rounded-lg">
                  Login
                </button>
              </Link>
              <Link href="/signup">
                <button className="bg-[#00B2E2] hover:bg-[#496c9c] px-4 py-2 rounded-lg">
                  Register
                </button>
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Hero Section with Background Image and Overlay */}
      <section
        className="relative h-screen w-full bg-cover bg-center bg-fixed pt-[70px]"
        style={{
          backgroundImage: "url('/homepagebg.jpg')",
        }}
      >
        {/* Dark gradient overlay */}
        <div
          className="absolute top-0 right-0 w-full h-full"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.8))",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 h-full text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simplify Client Projects. Strengthen Collaboration.
          </h2>
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mb-8">
            Manage timelines, track updates, and keep every deliverable on point
            — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {!isLoggedIn && (
              <Link href="/signup">
                <button className="bg-[#00B2E2] hover:bg-[#1e396b] text-white px-6 py-3 rounded-3xl transition-colors duration-200">
                  Register your Company
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
