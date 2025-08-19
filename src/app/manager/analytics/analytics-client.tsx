'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Clock,
  Calendar,
  BarChart3
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalStudents: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    studentsGrowth: number;
  };
  ordersByStatus: {
    pending: number;
    approved: number;
    preparing: number;
    ready: number;
    delivered: number;
    cancelled: number;
  };
  popularItems: Array<{
    id: string;
    name: string;
    category: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  dailyStats: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  monthlyStats: Array<{
    month: string;
    orders: number;
    revenue: number;
    students: number;
  }>;
}

export function AnalyticsClient() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manager/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {Math.abs(growth).toFixed(1)}%
      </div>
    );
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Time Period:</span>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.totalRevenue)}
              </p>
              {formatGrowth(analytics.overview.revenueGrowth)}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalOrders}</p>
              {formatGrowth(analytics.overview.ordersGrowth)}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalStudents}</p>
              {formatGrowth(analytics.overview.studentsGrowth)}
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.overview.averageOrderValue)}
              </p>
              <div className="text-sm text-gray-500">Per order</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Orders by Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
            const statusLabels: Record<string, string> = {
              pending: 'Pending',
              approved: 'Approved',
              preparing: 'Preparing',
              ready: 'Ready',
              delivered: 'Delivered',
              cancelled: 'Cancelled'
            };
            
            const statusColors: Record<string, string> = {
              pending: 'bg-yellow-100 text-yellow-800',
              approved: 'bg-blue-100 text-blue-800',
              preparing: 'bg-purple-100 text-purple-800',
              ready: 'bg-orange-100 text-orange-800',
              delivered: 'bg-green-100 text-green-800',
              cancelled: 'bg-red-100 text-red-800'
            };

            return (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                <Badge className={statusColors[status]}>
                  {statusLabels[status]}
                </Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Popular Items */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Menu Items</h3>
        <div className="space-y-4">
          {analytics.popularItems.slice(0, 10).map((item, index) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{item.totalOrders} orders</div>
                <div className="text-sm text-gray-600">{formatCurrency(item.totalRevenue)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Daily/Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Performance (Last 7 days)
          </h3>
          <div className="space-y-3">
            {analytics.dailyStats.slice(-7).map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">{day.orders}</span> orders
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(day.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Monthly Trends
          </h3>
          <div className="space-y-3">
            {analytics.monthlyStats.slice(-6).map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="text-sm text-gray-600">{month.month}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="font-medium">{month.orders}</span> orders
                  </div>
                  <div>
                    <span className="font-medium">{month.students}</span> students
                  </div>
                  <div className="font-medium">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}