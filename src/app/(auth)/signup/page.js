"use client";
import React, { Suspense } from "react";
import SignUpPage from "@/components/SignUpPage";


const SignUp = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading signup...</div>}>
        <SignUpPage />
      </Suspense>
    </div>
  );
};

export default SignUp;
