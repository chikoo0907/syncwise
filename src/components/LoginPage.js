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

export default function LoginPage() {
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

            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="space-y-2 w-[400px]">
                <Input
                  placeholder="hello@honypo.studio"
                  className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                />
                <div className="flex items-center space-x-2"></div>
              </div>

              <div className="space-y-2 w-[400px]">
                <Input
                  type="password"
                  placeholder="Password"
                  className="h-12 rounded-3xl focus:border-[#00B2E2] focus:ring-2 focus:ring-[#00B2E2] border border-gray-300"
                />
                <div className="flex items-center space-x-2"></div>
              </div>

              <Button className="w-[400px] h-12 rounded-3xl bg-[#00B2E2]">
                Log in
              </Button>
            </div>

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
              <Button variant="link" className="p-0 h-auto text-blue-500">
                Sign up
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Right Card: Image */}
      <div className="flex-1 flex items-center justify-center bg-[#e6f4fa] rounded-3xl">
        <img
          src="/your-image.png"
          alt="Decorative"
          className="w-2/3 max-w-lg object-contain"
        />
      </div>
    </div>
  );
}
