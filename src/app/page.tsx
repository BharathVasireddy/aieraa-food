import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="https://aieraa.com/wp-content/uploads/2020/08/Aieraa-Overseas-Logo.png"
                alt="Aieraa Hospitality"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Food</h1>
                <p className="text-xs text-gray-500">Hostel Ordering</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="text-sm sm:text-base px-3 sm:px-6 h-10 sm:h-14"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="text-sm sm:text-base px-3 sm:px-6 h-10 sm:h-14">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            Hostel Food Ordering Made Simple
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Internal food ordering system designed specifically for hostels. Easy ordering,
            efficient management, happy students.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
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
              <CardDescription>Complete control over universities and managers</CardDescription>
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
        <div className="text-center px-4">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Ready to get started?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto">
            Contact your university manager or sign up to begin ordering.
          </p>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12 sm:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">&copy; 2024 Aieraa Hospitality. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
