'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, Calendar, MoreVertical, UserX, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  university: {
    id: string;
    name: string;
    code?: string;
  };
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  SUSPENDED: { color: 'bg-gray-100 text-gray-800', label: 'Suspended' }
};

export function StudentsManagementClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showActions, setShowActions] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch all students for the manager's universities
      const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];
      const responses = await Promise.all(
        statuses.map((status) => fetch(`/api/manager/students?status=${status}`))
      );
      const datasets = await Promise.all(responses.map((res) => (res.ok ? res.json() : Promise.resolve({ students: [] }))));
      const merged = datasets.flatMap((d) => d.students || []);
      setStudents(merged);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAction = async (studentId: string, action: 'approve' | 'reject' | 'suspend' | 'reactivate') => {
    setProcessingIds(prev => new Set(prev).add(studentId));
    
    try {
      const endpoint = '/api/manager/students';
      const body: { studentId: string; action?: 'approve' | 'reject' | 'suspend' | 'reactivate' } = { studentId };

      if (action === 'approve' || action === 'reject') {
        body.action = action;
      } else if (action === 'suspend') {
        body.action = 'suspend';
      } else if (action === 'reactivate') {
        body.action = 'reactivate';
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchStudents(); // Refresh the list
        setShowActions(null);
      }
    } catch (error) {
      console.error(`Failed to ${action} student:`, error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.university.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = { ALL: students.length };
    Object.keys(statusConfig).forEach(status => {
      counts[status] = students.filter(student => student.status === status).length;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-full text-sm"
            >
              <option value="ALL">All Students ({statusCounts.ALL})</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label} ({statusCounts[status] || 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading students...</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => {
            const statusInfo = statusConfig[student.status];
            const isProcessing = processingIds.has(student.id);

            return (
              <Card key={student.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowActions(showActions === student.id ? null : student.id)}
                          disabled={isProcessing}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        
                        {showActions === student.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                            {student.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleStudentAction(student.id, 'approve')}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStudentAction(student.id, 'reject')}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <UserX className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {student.status === 'APPROVED' && (
                              <button
                                onClick={() => handleStudentAction(student.id, 'suspend')}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <UserX className="h-4 w-4" />
                                Suspend
                              </button>
                            )}
                            {student.status === 'SUSPENDED' && (
                              <button
                                onClick={() => handleStudentAction(student.id, 'reactivate')}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="h-4 w-4" />
                                Reactivate
                              </button>
                            )}
                            {student.status === 'REJECTED' && (
                              <button
                                onClick={() => handleStudentAction(student.id, 'approve')}
                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <UserCheck className="h-4 w-4" />
                                Approve
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined: {formatDate(student.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">University: </span>
                        <span className="text-gray-600">
                          {student.university.name}
                          {student.university.code && ` (${student.university.code})`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredStudents.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? "Try adjusting your search term" 
                  : statusFilter !== 'ALL'
                    ? `No ${statusFilter.toLowerCase()} students found`
                    : "No students registered yet"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}