// src/components/LoginPage.js
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
  import React from "react";
  import { auth, db } from "@/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { useRouter } from "next/navigation";
  
  export default function LoginPage() {
    const [form, setForm] = React.useState({
      email: "",
      password: "",
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const router = useRouter();

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
        const user = userCredential.user;
        
        // Check if user is a company or client
        const companyDoc = await getDoc(doc(db, "companies", user.uid));
        const clientDoc = await getDoc(doc(db, "clients", user.uid));
        
        if (companyDoc.exists()) {
          // User is a company, redirect to dashboard
          router.push("/dashboard");
        } else if (clientDoc.exists()) {
          // User is a client, redirect to client page
          router.push("/client");
        } else {
          // User exists in auth but not in either collection
          setError("User profile not found. Please contact support.");
        }
      } catch (err) {
        setError(err.message || "Login failed");
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="h-screen w-full flex items-stretch bg-gray-50 p-10 gap-8">
        {/* Left Card: Login */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="flex-1 h-full flex flex-col justify-center  rounded-3xl shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">SyncWise</CardTitle>
              <CardDescription className="text-lg">
                Welcome to SyncWise
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* <p className="text-sm text-center text-gray-600">
                Gaze and attention modeling powered by AI is optimizing virtual
                reality experiences
              </p> */}

              <form className="space-y-4 w-full flex flex-col items-center" onSubmit={handleSubmit}>
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
                {error && (
                  <div className="text-red-500 text-sm w-[400px] text-center">{error}</div>
                )}
                <Button
                  className="w-[400px] h-12 rounded-3xl bg-[#00B2E2]"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in"}
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
                Dont have an account?{" "}
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500"
                  onClick={() => router.push("/signup")}
                >
                  Sign up
                </Button>
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Right Card: Image */}
        <div className="flex-1 flex items-center justify-center bg-[#e6f4fa] rounded-3xl">
          <img
            src="/globe.svg"
            alt="Decorative"
            className="w-2/3 max-w-lg object-contain"
          />
        </div>
      </div>
    );
  }