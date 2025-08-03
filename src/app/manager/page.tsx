import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ManagerSidebar } from "@/components/navigation/manager-sidebar";

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MANAGER") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <ManagerSidebar 
        userName={session.user.name} 
        universityName={session.user.university || "University"}
      />
      
      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile header space */}
        <div className="lg:hidden h-16"></div>
        
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name}</h1>
            <p className="text-gray-600">Manage your university&apos;s food ordering system.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-orange-600">5</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏳</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menu Items</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">🍽️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👨‍🎓</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-gray-900">18</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📦</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Menu Management</h3>
              <p className="text-gray-600 mb-4">Create and manage your university&apos;s menu</p>
              <Button className="w-full">Manage Menu</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Approvals</h3>
              <p className="text-gray-600 mb-4">Approve or reject student registrations</p>
              <Button className="w-full">Review Students</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-gray-600 mb-4">View and manage incoming orders</p>
              <Button className="w-full">View Orders</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">View university-specific analytics</p>
              <Button className="w-full">View Analytics</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
              <p className="text-gray-600 mb-4">Manage registered students</p>
              <Button className="w-full">Manage Students</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-600 mb-4">Generate and download reports</p>
              <Button className="w-full">Generate Reports</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}