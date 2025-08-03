'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        // Styling for different types
        success: {
          style: {
            border: '2px solid #16A349',
            background: '#f0fdf4',
            color: '#15803d',
          },
          iconTheme: {
            primary: '#16A349',
            secondary: '#ffffff',
          },
        },
        error: {
          style: {
            border: '2px solid #ef4444',
            background: '#fef2f2',
            color: '#dc2626',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
        loading: {
          style: {
            border: '2px solid #6b7280',
            background: '#f9fafb',
            color: '#374151',
          },
        },
      }}
    />
  );
}