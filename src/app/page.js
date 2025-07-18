"use client";
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignupPage";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="h-full">
        {/* <LoginPage /> */}
        <SignupPage />
      </div>
    </>
  );
}
