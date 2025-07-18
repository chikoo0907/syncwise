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

export default function SignupPage() {
  // --- Backend logic from user code ---
  const [userType, setUserType] = useState("company"); // "company" or "client"
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    password: "",
    clientName: "",
    mobile: "",
  });

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
      mobile: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userType === "company") {
      // Handle company signup logic here
      console.log("Company Signup:", {
        companyName: form.companyName,
        email: form.email,
        password: form.password,
      });
    } else {
      // Handle client signup logic here
      console.log("Client Signup:", {
        clientName: form.clientName,
        mobile: form.mobile,
        password: form.password,
      });
    }
  };
  // --- End backend logic ---

  return (
    <div className="h-screen w-full flex items-stretch bg-gray-50 p-10 gap-8">
      {/* Left Card: Image */}
      <div className="flex-1 flex items-center justify-center bg-[#e6f4fa] rounded-3xl">
        <img
          src="/your-image.png"
          alt="Decorative"
          className="w-2/3 max-w-lg object-contain"
        />
      </div>
      {/* Right Card: Signup */}
      <div className="flex-1 flex items-center justify-center w-full">
        <Card className="flex-1 h-full flex flex-col justify-center rounded-3xl shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">SyncWise</CardTitle>
            <CardDescription className="text-lg">
              Create your SyncWise account
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
              <Button
                className="w-[400px] h-12 rounded-3xl bg-[#00B2E2]"
                type="submit"
              >
                Sign up
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
              <Button variant="link" className="p-0 h-auto text-blue-500">
                Log in
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
