'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, Filter, Mail, Phone, Calendar } from 'lucide-react';

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
  university: {
    id: string;
    name: string;
    code?: string;
  };
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  SUSPENDED: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Suspended' }
};

export function StudentApprovalsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/manager/students?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentAction = async (studentId: string, action: 'approve' | 'reject') => {
    setProcessingIds(prev => new Set(prev).add(studentId));
    
    try {
      const response = await fetch('/api/manager/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action })
      });

      if (response.ok) {
        await fetchStudents(); // Refresh the list
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
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = () => {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0 };
    students.forEach(student => {
      counts[student.status]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([status, config]) => {
          const Icon = config.icon;
          const count = statusCounts[status as keyof typeof statusCounts];
          
          return (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="rounded-full flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {config.label}
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full"
        />
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
            const StatusIcon = statusInfo.icon;
            const isProcessing = processingIds.has(student.id);

            return (
              <Card key={student.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
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
                            <span>Applied: {formatDate(student.createdAt)}</span>
                          </div>
                        </div>
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

                  {/* Actions */}
                  {student.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <LoadingButton
                        onClick={() => handleStudentAction(student.id, 'approve')}
                        loading={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </LoadingButton>
                      <LoadingButton
                        onClick={() => handleStudentAction(student.id, 'reject')}
                        loading={isProcessing}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </LoadingButton>
                    </div>
                  )}
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
                  : `No ${statusFilter.toLowerCase()} students at this time`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}