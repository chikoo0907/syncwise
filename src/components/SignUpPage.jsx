"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  // --- Backend logic from user code ---
  const [userType, setUserType] = useState("company"); // "company" or "client"
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    clientName: "",
    clientCompanyName: "",
    clientCompanyLink: "",
    companyId: "", // stored when joining via invite link
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setForm({
      companyName: "",
      email: "",
      password: "",
      clientName: "",
      clientCompanyName: "",
      clientCompanyLink: "",
      companyId: "",
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let email, displayName;
      if (userType === "company") {
        email = form.email;
        displayName = form.companyName;
      } else {
        email = form.email;
        displayName = form.clientName;
      }
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        form.password
      );
      const user = userCredential.user;
      // Store user info in Firestore
      if (userType === "company") {
        const inviteLink = `${window.location.origin}/signup?companyId=${user.uid}`;
        await setDoc(doc(db, "companies", user.uid), {
          userType,
          email,
          displayName,
          companyName: form.companyName,
          inviteLink,
          createdAt: new Date(),
        });
      } else {
        // Get companyId from URL params if not in form (for invite link signups)
        const companyIdFromUrl = searchParams.get("companyId");
        let finalCompanyId = form.companyId || companyIdFromUrl;
        
        // Check if companyName field contains a URL (invite link) and extract companyId
        let companyNameFromForm = form.clientCompanyName;
        if (companyNameFromForm && (companyNameFromForm.startsWith("http://") || companyNameFromForm.startsWith("https://"))) {
          try {
            const url = new URL(companyNameFromForm);
            const extractedCompanyId = url.searchParams.get("companyId");
            if (extractedCompanyId) {
              finalCompanyId = finalCompanyId || extractedCompanyId;
              companyNameFromForm = ""; // Clear the URL, we'll fetch the real name
              console.log(`Extracted companyId "${extractedCompanyId}" from URL in companyName field`);
            }
          } catch (urlErr) {
            // Not a valid URL, treat as company name
          }
        }
        
        // If we have a companyId, ALWAYS fetch the actual company name from Firestore
        // This ensures we never save a URL or incorrect value as companyName
        let finalCompanyName = companyNameFromForm;
        if (finalCompanyId) {
          try {
            const companyDoc = await getDoc(doc(db, "companies", finalCompanyId));
            if (companyDoc.exists()) {
              finalCompanyName = companyDoc.data().companyName;
              console.log(`Fetched company name "${finalCompanyName}" for companyId: ${finalCompanyId}`);
            } else {
              console.error(`Company not found for companyId: ${finalCompanyId}`);
            }
          } catch (err) {
            console.error("Error fetching company name:", err);
          }
        }
        
        const clientData = {
          userType,
          email,
          displayName,
          clientName: form.clientName,
          companyName: finalCompanyName,
          createdAt: new Date(),
        };
        
        // Always include companyId if we have it (from invite link)
        if (finalCompanyId) {
          clientData.companyId = finalCompanyId;
        }
        
        await setDoc(doc(db, "clients", user.uid), clientData);
        console.log("Client signed up with data:", { ...clientData, password: "[hidden]" });
      }
      // Redirect based on user type
      if (userType === "company") {
        router.push("/dashboard");
      } else {
        router.push("/client");
      }
      // Optionally, redirect or show success
      alert("Signup successful!");
      setForm({
        companyName: "",
        email: "",
        password: "",
        clientName: "",
        clientCompanyName: "",
        clientCompanyLink: "",
        companyId: "",
      });
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };
  // --- End backend logic ---

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const companyId = searchParams.get("companyId");
    if (companyId) {
      setUserType("client");
      const fetchCompany = async () => {
        try {
          const companyDoc = await getDoc(doc(db, "companies", companyId));
          if (companyDoc.exists()) {
            const fetchedName = companyDoc.data().companyName;
            setForm((prev) => ({
              ...prev,
              clientCompanyName: fetchedName,
              companyId: companyId, // store companyId for Firestore
            }));
          }
        } catch (error) {
          console.error("Error fetching company for invite:", error);
        }
      };
      fetchCompany();
    }
  }, [searchParams]);

  return (
    <div className="h-screen w-full flex items-stretch bg-gray-50 p-10 gap-8">
      {/* Left Card: Image */}
      <div className="flex bg-[#e6f4fa] rounded-3xl w-5/12">
        <img
          src="/bg2.jpg"
          alt="Decorative"
          className=" object-fill w-full  rounded-3xl"
        />
      </div>
      {/* Right Card: Signup */}
      <div className=" flex-1 flex items-center justify-center">
        <Card className="flex-1 h-full flex flex-col justify-center rounded-3xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">ProjectiaCore</CardTitle>
            <CardDescription className="text-lg">
              Create your ProjectiaCore account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* <p className="text-sm text-center text-gray-600">
              Gaze and attention modeling powered by AI is optimizing virtual
              reality experiences
            </p> */}

            <div className="flex justify-center mb-4 gap-2">
              <Button
                type="button"
                variant={userType === "company" ? "default" : "outline"}
                className={
                  userType === "company"
                    ? "bg-[#00B2E2] text-white rounded-3xl"
                    : "rounded-3xl"
                }
                onClick={() => handleUserTypeChange("company")}
              >
                Company
              </Button>
              <Button
                type="button"
                variant={userType === "client" ? "default" : "outline"}
                className={
                  userType === "client"
                    ? "bg-[#00B2E2] text-white rounded-3xl"
                    : "rounded-3xl"
                }
                onClick={() => handleUserTypeChange("client")}
              >
                Client
              </Button>
            </div>

            <form
              className="space-y-4 w-full flex flex-col items-center"
              onSubmit={handleSubmit}
            >
              {userType === "company" ? (
                <>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      placeholder="Company Name"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      placeholder="Email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      placeholder="Name"
                      name="clientName"
                      value={form.clientName}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      placeholder="Company Name or paste Invite Link"
                      name="clientCompanyName"
                      value={form.clientCompanyName}
                      readOnly={!!searchParams.get("companyId")}
                      onChange={async (e) => {
                        const val = e.target.value;
                        // Always update the visible field
                        setForm((prev) => ({
                          ...prev,
                          clientCompanyName: val,
                          companyId: "",
                        }));
                        // If it looks like a URL, try to resolve company from link
                        try {
                          const url = new URL(val);
                          const cid = url.searchParams.get("companyId");
                          if (cid) {
                            const companyDoc = await getDoc(doc(db, "companies", cid));
                            if (companyDoc.exists()) {
                              setForm((prev) => ({
                                ...prev,
                                clientCompanyName: companyDoc.data().companyName,
                                companyId: cid,
                              }));
                            }
                          }
                        } catch { }
                      }}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                    {form.companyId && (
                      <p className="text-xs text-[#00B2E2] px-3">
                        ✓ Company found: {form.clientCompanyName}
                      </p>
                    )}
                    {searchParams.get("companyId") && (
                      <p className="text-xs text-[#00B2E2] px-3">
                        ✓ Joining via invite link
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      placeholder="Email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                  <div className="space-y-2 w-[400px]">
                    <Input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                    />
                  </div>
                </>
              )}
              {error && (
                <div className="text-red-500 text-sm w-[400px] text-center">
                  {error}
                </div>
              )}
              <Button
                className="w-[400px] h-12 rounded-3xl bg-[#00B2E2]"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign up"}
              </Button>
            </form>

            <div className="flex items-center">
              <Separator className="flex-1" />
              <span className="px-4 text-sm text-gray-500">or</span>
              <Separator className="flex-1" />
            </div>
            {/* <div className="flex flex-col items-center">
              <Button
                variant="outline"
                className="w-[400px] gap-2 h-12 rounded-3xl"
              >
                <span className="text-blue-500 font-bold">G</span>
                Sign up with Google
              </Button>
            </div> */}
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-500"
                type="button"
                onClick={() => router.push("/login")}
              >
                Log in
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
