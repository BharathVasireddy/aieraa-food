'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Filter, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: string[];
}

const reportTypes: ReportType[] = [
  {
    id: 'orders',
    title: 'Orders Report',
    description: 'Complete list of orders with customer details and status',
    icon: FileText,
    fields: ['Order Number', 'Customer', 'Items', 'Total Amount', 'Status', 'Date']
  },
  {
    id: 'students',
    title: 'Students Report',
    description: 'All registered students with their status and details',
    icon: FileText,
    fields: ['Name', 'Email', 'Phone', 'Status', 'Registration Date', 'University']
  },
  {
    id: 'revenue',
    title: 'Revenue Report',
    description: 'Financial summary with revenue breakdown by period',
    icon: FileText,
    fields: ['Date', 'Orders Count', 'Total Revenue', 'Average Order Value']
  },
  {
    id: 'menu-performance',
    title: 'Menu Performance',
    description: 'Popular items and sales performance analytics',
    icon: FileText,
    fields: ['Item Name', 'Category', 'Total Orders', 'Revenue', 'Popularity Rank']
  }
];

export function ReportsClient() {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState('csv');

  const handleGenerateReport = async (reportType: string) => {
    setGeneratingReport(reportType);
    
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      });

      const response = await fetch(`/api/manager/reports?${params}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setGeneratingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Report Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Start Date
            </label>
            <Input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </label>
            <Input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="csv">CSV</option>
              <option value="excel">Excel (XLSX)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isGenerating = generatingReport === report.id;

          return (
            <Card key={report.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Included Fields:</h4>
                    <div className="flex flex-wrap gap-1">
                      {report.fields.map((field) => (
                        <span
                          key={field}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <LoadingButton
                    onClick={() => handleGenerateReport(report.id)}
                    loading={isGenerating}
                    className="w-full rounded-full"
                    disabled={!!generatingReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Report'}
                  </LoadingButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Report Activity
        </h3>
        
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No recent reports generated</p>
          <p className="text-sm">Reports you generate will appear here for easy re-download</p>
        </div>
      </Card>

      {/* Report Guidelines */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Report Guidelines</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Reports include data only from universities you manage</p>
          <p>• Large date ranges may take longer to generate</p>
          <p>• CSV format is recommended for data analysis</p>
          <p>• PDF format is best for presentation and printing</p>
          <p>• All reports respect student privacy and data protection policies</p>
        </div>
      </Card>
    </div>
  );
}