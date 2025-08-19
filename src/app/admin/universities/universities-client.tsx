'use client';

import { useState, useEffect } from 'react';

import { Plus, Edit2, Trash2, Building, Users, ChefHat, ShoppingBag, UserPlus, MoreVertical, AlertTriangle } from 'lucide-react';
import { showToast } from '@/lib/error-handlers';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageLoading } from '@/components/ui/loading';

interface University {
  id: string;
  code: string | null;
  name: string;
  location: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    students: number;
    managers: number;
    menus: number;
    orders: number;
  };
}

export default function UniversitiesClient() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    location: '',
    description: '',
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [selectedUniversityForManager, setSelectedUniversityForManager] = useState<University | null>(null);
  const [managerFormData, setManagerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [universityToDelete, setUniversityToDelete] = useState<University | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchUniversities();
  }, []);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showForm) {
          resetForm();
        } else if (showManagerForm) {
          resetManagerForm();
        } else if (showDeleteConfirm) {
          handleCancelDelete();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showForm, showManagerForm, showDeleteConfirm]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm || showManagerForm || showDeleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm, showManagerForm, showDeleteConfirm]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on the menu button or inside the menu
      if (target.closest('[data-action-menu]') || target.closest('[data-action-button]')) {
        return;
      }
      
      setOpenActionMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/admin/universities');
      const data = await response.json();
      if (response.ok) {
        setUniversities(data.universities);
      } else {
        showToast.error(data.error || 'Failed to fetch universities');
      }
    } catch (error) {
      showToast.error('Failed to fetch universities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast.error('University name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const url = selectedUniversity 
        ? `/api/admin/universities/${selectedUniversity.id}`
        : '/api/admin/universities';
      
      const method = selectedUniversity ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message);
        setShowForm(false);
        setSelectedUniversity(null);
        setFormData({
          code: '',
          name: '',
          location: '',
          description: '',
          isActive: true,
        });
        fetchUniversities();
      } else {
        showToast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      showToast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (university: University) => {
    setSelectedUniversity(university);
    setFormData({
      code: university.code || '',
      name: university.name,
      location: university.location || '',
      description: university.description || '',
      isActive: university.isActive,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (university: University) => {
    setUniversityToDelete(university);
    setShowDeleteConfirm(true);
    setOpenActionMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!universityToDelete) return;

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/universities/${universityToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message);
        fetchUniversities();
        setShowDeleteConfirm(false);
        setUniversityToDelete(null);
      } else {
        showToast.error(data.error || 'Failed to delete university');
      }
    } catch (error) {
      showToast.error('Failed to delete university');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUniversityToDelete(null);
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedUniversity(null);
    setFormData({
      code: '',
      name: '',
      location: '',
      description: '',
      isActive: true,
    });
  };

  const handleCreateManager = (university: University) => {
    setSelectedUniversityForManager(university);
    setManagerFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    });
    setShowManagerForm(true);
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!managerFormData.name.trim() || !managerFormData.email.trim() || !managerFormData.password.trim()) {
      showToast.error('Please fill in all required fields');
      return;
    }

    if (!selectedUniversityForManager) {
      showToast.error('No university selected');
      return;
    }

    setIsCreatingManager(true);
    
    try {
      const response = await fetch('/api/admin/managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: managerFormData.name.trim(),
          email: managerFormData.email.trim(),
          phone: managerFormData.phone.trim() || null,
          password: managerFormData.password,
          universityId: selectedUniversityForManager.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(data.message);
        setShowManagerForm(false);
        setSelectedUniversityForManager(null);
        setManagerFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
        });
        fetchUniversities(); // Refresh to update manager counts
      } else {
        showToast.error(data.error || 'Failed to create manager');
      }
    } catch (error) {
      showToast.error('Failed to create manager');
    } finally {
      setIsCreatingManager(false);
    }
  };

  const resetManagerForm = () => {
    setShowManagerForm(false);
    setSelectedUniversityForManager(null);
    setManagerFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    });
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Universities</h1>
          <p className="text-gray-600">Manage universities and their settings</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Add University
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={resetForm}
          />
          
          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedUniversity ? 'Edit University' : 'Add New University'}
                    </CardTitle>
                    <CardDescription>
                      {selectedUniversity ? 'Update university information' : 'Create a new university'}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetForm}
                    className="shrink-0"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="DNU, MIT, HU, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={10}
                    pattern="[A-Z0-9]{2,10}"
                    title="2-10 characters, uppercase letters and numbers only"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    2-10 characters, uppercase letters and numbers only
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dai Nam University"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Hanoi, Vietnam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the university"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {selectedUniversity && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    University is active
                  </label>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? 'Saving...' : selectedUniversity ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
          </div>
        </>
      )}

      {/* Manager Form Modal */}
      {showManagerForm && selectedUniversityForManager && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={resetManagerForm}
          />
          
          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Create Manager</CardTitle>
                    <CardDescription>
                      Add a new manager for {selectedUniversityForManager.name}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetManagerForm}
                    className="shrink-0"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManagerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manager Name *
                    </label>
                    <input
                      type="text"
                      value={managerFormData.name}
                      onChange={(e) => setManagerFormData({ ...managerFormData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={managerFormData.email}
                      onChange={(e) => setManagerFormData({ ...managerFormData, email: e.target.value })}
                      placeholder="manager@university.edu"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={managerFormData.phone}
                      onChange={(e) => setManagerFormData({ ...managerFormData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={managerFormData.password}
                      onChange={(e) => setManagerFormData({ ...managerFormData, password: e.target.value })}
                      placeholder="Temporary password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Manager can change password after first login
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button type="submit" disabled={isCreatingManager} className="w-full sm:w-auto">
                      {isCreatingManager ? 'Creating...' : 'Create Manager'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetManagerForm} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && universityToDelete && (
        <>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={handleCancelDelete}
          />
          
          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <Card className="w-full max-w-md pointer-events-auto">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-gray-900">Delete University</CardTitle>
                    <CardDescription>
                      This action cannot be undone. This will permanently delete the university and all associated data.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    <strong>You are about to delete:</strong><br />
                    <span className="font-medium">{universityToDelete.name}</span>
                    {universityToDelete.location && (
                      <span className="text-red-700"> • {universityToDelete.location}</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white order-1 sm:order-2"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete University'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Universities List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {universities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No universities found</h3>
              <p className="text-gray-600 text-center mb-4">
                Get started by adding your first university to the system.
              </p>
              <Button onClick={() => setShowForm(true)}>
                Add University
              </Button>
            </CardContent>
          </Card>
        ) : (
          universities.map((university) => (
            <Card 
              key={university.id} 
              className={`transition-all duration-200 ${
                !university.isActive 
                  ? 'opacity-60 bg-gray-50 border-gray-300' 
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg sm:text-xl font-semibold ${
                          university.isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {university.name}
                        </h3>
                        {!university.isActive && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {university.code && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {university.code}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline"
                          className={`text-xs font-medium ${
                            university.isActive 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {university.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    
                    {university.location && (
                      <p className={`mb-2 ${university.isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                        {university.location}
                      </p>
                    )}
                    
                    {university.description && (
                      <p className={`mb-4 ${university.isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {university.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className={`flex items-center gap-6 text-sm ${
                      university.isActive ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{university._count.students}</span>
                        <span>Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{university._count.managers}</span>
                        <span>Managers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        <span className="font-medium">{university._count.menus}</span>
                        <span>Menus</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto lg:ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(university)}
                      className="flex-1 lg:flex-none"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="lg:hidden ml-2">Edit</span>
                    </Button>
                    
                    {/* Actions Menu */}
                    <div className="relative flex-1 lg:flex-none">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpenActionMenuId(
                            openActionMenuId === university.id ? null : university.id
                          );
                        }}
                        className="w-full lg:w-auto"
                        data-action-button
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="lg:hidden ml-2">Actions</span>
                      </Button>
                      
                      {openActionMenuId === university.id && (
                        <div 
                          className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                          data-action-menu
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleCreateManager(university);
                                setOpenActionMenuId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <UserPlus className="h-4 w-4" />
                              Add Manager
                            </button>
                            <button
                              onClick={() => handleDeleteClick(university)}
                              disabled={university._count.students > 0 || university._count.managers > 0 || university._count.menus > 0 || university._count.orders > 0}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete University
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}