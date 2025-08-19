'use client';

import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChefHat, 
  Package, 
  Search, 
  Filter,
  Calendar,
  User,
  DollarSign,
  Eye,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menuItem: {
    id: string;
    name: string;
    image?: string;
  };
  variant: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'PREPARING' | 'READY_TO_COLLECT' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  university: {
    id: string;
    name: string;
  };
  items: OrderItem[];
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, label: 'Pending', nextAction: 'approve' },
  APPROVED: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle, label: 'Approved', nextAction: 'preparing' },
  PREPARING: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: ChefHat, label: 'Preparing', nextAction: 'ready' },
  READY_TO_COLLECT: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package, label: 'Ready', nextAction: 'delivered' },
  DELIVERED: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, label: 'Delivered', nextAction: null },
  CANCELLED: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, label: 'Cancelled', nextAction: null }
};

const nextStatusMap = {
  approve: 'APPROVED',
  preparing: 'PREPARING',
  ready: 'READY_TO_COLLECT',
  delivered: 'DELIVERED'
};

export function OrdersManagementClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Click outside to close action menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuOpen) {
        setActionMenuOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manager/orders?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderNumber: string, action: string) => {
    setProcessingIds(prev => new Set(prev).add(orderNumber));
    
    try {
      const newStatus = action === 'cancel' ? 'CANCELLED' : nextStatusMap[action as keyof typeof nextStatusMap];
      const response = await fetch(`/api/manager/orders/by-number/${orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchOrders();
        setActionMenuOpen(null);
      }
    } catch (error) {
      console.error(`Failed to update order:`, error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderNumber);
        return newSet;
      });
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    Object.keys(statusConfig).forEach(status => {
      counts[status] = orders.filter(order => order.status === status).length;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Orders</h2>
          <p className="text-gray-600">Manage incoming orders from students</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Card className="p-1">
        <div className="flex gap-1 overflow-x-auto">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(order => order.status === status).length;
            
            return (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "ghost"}
                onClick={() => setStatusFilter(status)}
                size="sm"
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {config.label}
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select>
              <option>All time</option>
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status];
                const StatusIcon = statusInfo.icon;
                const isProcessing = processingIds.has(order.orderNumber);

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionMenuOpen(actionMenuOpen === order.orderNumber ? null : order.orderNumber)}
                          disabled={isProcessing}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        
                        {actionMenuOpen === order.orderNumber && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                setSelectedOrder(order);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View details
                            </button>
                            
                            {statusInfo.nextAction && (
                              <button
                                onClick={() => handleOrderAction(order.orderNumber, statusInfo.nextAction!)}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {statusInfo.nextAction === 'approve' && 'Approve order'}
                                {statusInfo.nextAction === 'preparing' && 'Start preparing'}
                                {statusInfo.nextAction === 'ready' && 'Mark ready'}
                                {statusInfo.nextAction === 'delivered' && 'Mark delivered'}
                              </button>
                            )}
                            
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <>
                                <hr className="my-1" />
                                <button
                                  onClick={() => handleOrderAction(order.orderNumber, 'cancel')}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Cancel order
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search term" 
                : `No ${statusFilter.toLowerCase()} orders at this time`}
            </p>
          </div>
        )}
      </Card>

      {/* Selected orders actions */}
      {selectedOrders.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedOrders.size} order{selectedOrders.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Export selected
              </Button>
              <Button variant="outline" size="sm">
                Mark as delivered
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Cancel selected
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Order #{selectedOrder.orderNumber}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Name: {selectedOrder.user.name}</div>
                  <div>Email: {selectedOrder.user.email}</div>
                  {selectedOrder.user.phone && <div>Phone: {selectedOrder.user.phone}</div>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {item.menuItem.image && (
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.menuItem.name}</h4>
                        <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${item.price.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">${item.variant.price.toFixed(2)} each</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}