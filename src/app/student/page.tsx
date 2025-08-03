import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StudentNavigation } from "@/components/navigation/student-navigation";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavigation 
        userName={session.user.name} 
        universityName={session.user.university || "University"}
      />
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Today&apos;s Menu</h1>
          <p className="text-gray-600">Order your favorite food from {session.user.university}</p>
        </div>

        {/* Featured Items */}
        <div className="bg-primary text-white rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Today&apos;s Special</h2>
              <p className="text-white/90 mb-4">Delicious Biryani with Raita & Dessert</p>
              <Button variant="secondary">Order Now - ₹120</Button>
            </div>
            <div className="text-6xl">🍛</div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🍛</div>
              <p className="font-medium text-gray-900">Main Course</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🥤</div>
              <p className="font-medium text-gray-900">Beverages</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🍰</div>
              <p className="font-medium text-gray-900">Desserts</p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🥗</div>
              <p className="font-medium text-gray-900">Snacks</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Menu</h3>
            <p className="text-gray-600 mb-4">View all available food items and prices</p>
            <Button className="w-full">View Full Menu</Button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Cart</h3>
            <p className="text-gray-600 mb-4">2 items • ₹240</p>
            <Button className="w-full">View Cart</Button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Order History</h3>
            <p className="text-gray-600 mb-4">Last order: Yesterday</p>
            <Button className="w-full">View Orders</Button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-gray-600 mb-4">5 saved items</p>
            <Button className="w-full">View Favorites</Button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet</h3>
            <p className="text-gray-600 mb-4">Balance: ₹500</p>
            <Button className="w-full">Add Money</Button>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Support</h3>
            <p className="text-gray-600 mb-4">Need help with your order?</p>
            <Button className="w-full">Get Help</Button>
          </div>
        </div>
      </main>
    </div>
  );
}