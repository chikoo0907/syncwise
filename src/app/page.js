"use client"
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth } from '@/firebase';

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
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Head>
        <title>ProManage - IT Project Management</title>
      </Head>

      {/* Header/Navbar */}
      <header className="bg-gray-900 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">ProManage</h1>
          <nav className="space-x-4 hidden md:block">
            <a href="#" className="hover:text-blue-400">Home</a>
            <a href="#" className="hover:text-blue-400">About</a>
            <a href="#" className="hover:text-blue-400">Contact</a>
          </nav>
          {!isLoggedIn ? (
            <div className="space-x-2">
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Login</button>
              </Link>
              <Link href="/signup">
                <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">Register</button>
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Logout</button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-br from-blue-100 to-purple-200">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">One Platform to Manage Your IT Projects and Clients</h2>
        <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mb-8">
          Empower your IT company with tools to manage projects, track deliverables, and communicate with clients — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {!isLoggedIn && (
            <>
              <Link href="/signup">
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded">Register your Company</button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white text-center px-4">
        <h3 className="text-3xl font-bold mb-10">How It Works</h3>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            "Company registers",
            "Adds team & clients",
            "Manages projects",
            "Clients stay updated",
          ].map((step, i) => (
            <div key={i} className="bg-gray-100 p-6 rounded shadow-md">
              <div className="text-2xl font-bold mb-2">Step {i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <p>© 2025 ProManage. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:underline">Contact</a>
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
