import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Aieraa Food</h1>
              <p className="text-sm text-gray-600">by Aieraa Hospitality</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Hostel Food Ordering Made Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Internal food ordering system designed specifically for hostels. 
            Easy ordering, efficient management, happy students.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">For Students</CardTitle>
              <CardDescription>
                Browse menus, add items to cart, and place orders easily
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Mobile-first design</li>
                <li>• Quick cart management</li>
                <li>• Order tracking</li>
                <li>• University-specific menus</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">For Managers</CardTitle>
              <CardDescription>
                Manage your university&apos;s menu and approve students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Menu management</li>
                <li>• Student approval system</li>
                <li>• Order management</li>
                <li>• University analytics</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">For Admins</CardTitle>
              <CardDescription>
                Complete control over universities and managers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• University management</li>
                <li>• Manager assignment</li>
                <li>• Global analytics</li>
                <li>• System configuration</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-gray-600 mb-6">
            Contact your university manager or sign up to begin ordering.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Aieraa Hospitality. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}