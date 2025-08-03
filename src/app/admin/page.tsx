import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/navigation/admin-sidebar";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AdminSidebar userName={session.user.name} />
      
      {/* Main content */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile header space */}
        <div className="lg:hidden h-16"></div>
        
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {session.user.name}</h1>
            <p className="text-gray-600">Here&apos;s what&apos;s happening with your system today.</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Universities</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🏫</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Managers</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">👨‍💼</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">🎓</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today&apos;s Orders</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <span className="text-orange-600 text-xl">🛒</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Universities</h3>
              <p className="text-gray-600 mb-4">Manage universities and their settings</p>
              <Button className="w-full">Manage Universities</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Managers</h3>
              <p className="text-gray-600 mb-4">Assign managers to universities</p>
              <Button className="w-full">Manage Managers</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">View system-wide analytics</p>
              <Button className="w-full">View Analytics</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Users</h3>
              <p className="text-gray-600 mb-4">Manage all system users</p>
              <Button className="w-full">Manage Users</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
              <p className="text-gray-600 mb-4">View all orders across universities</p>
              <Button className="w-full">View All Orders</Button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-600 mb-4">System configuration and settings</p>
              <Button className="w-full">System Settings</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}