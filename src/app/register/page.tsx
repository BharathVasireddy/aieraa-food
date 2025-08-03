import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">Aieraa Food</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Register as a student to start ordering food
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="university" className="text-sm font-medium text-gray-700">
                University
              </label>
              <select 
                id="university"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select your university</option>
                <option value="iit-delhi">IIT Delhi</option>
                <option value="iit-bombay">IIT Bombay</option>
                <option value="bits-pilani">BITS Pilani</option>
                <option value="delhi-university">Delhi University</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
              />
            </div>
            <Button className="w-full">
              Create Account
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After registration, your account will need approval from your university manager before you can start ordering.
          </p>
        </div>
      </div>
    </div>
  );
}