'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface DashboardStats {
  pendingApprovals: number;
  menuItems: number;
  activeStudents: number;
  todaysOrders: number;
  universities: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

export function ManagerDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/manager/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-3xl p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.pendingApprovals || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.menuItems || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.activeStudents || 0}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats?.todaysOrders || 0}</p>
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
          <Link href="/manager/menu">
            <Button className="w-full">Manage Menu</Button>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Approvals</h3>
          <p className="text-gray-600 mb-4">Approve or reject student registrations</p>
          <Link href="/manager/approvals">
            <Button className="w-full">Review Students</Button>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
          <p className="text-gray-600 mb-4">View and manage incoming orders</p>
          <Link href="/manager/orders">
            <Button className="w-full">View Orders</Button>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
          <p className="text-gray-600 mb-4">View university-specific analytics</p>
          <Link href="/manager/analytics">
            <Button className="w-full">View Analytics</Button>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
          <p className="text-gray-600 mb-4">Manage registered students</p>
          <Link href="/manager/students">
            <Button className="w-full">Manage Students</Button>
          </Link>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
          <p className="text-gray-600 mb-4">Generate and download reports</p>
          <Link href="/manager/reports">
            <Button className="w-full">Generate Reports</Button>
          </Link>
        </div>
      </div>
    </>
  );
}