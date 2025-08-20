'use client';

import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BarChart3,
  Calendar,
  ChefHat,
  FileText,
  Home,
  Menu,
  ShoppingBag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

import { LogoutButton } from '@/components/logout-button';

import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const managerNavItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/manager', icon: Home },
  { name: 'Menu', href: '/manager/menu', icon: ChefHat },
  { name: 'Availability', href: '/manager/menu/availability', icon: Calendar },
  { name: 'Student Approvals', href: '/manager/approvals', icon: UserCheck },
  { name: 'Orders', href: '/manager/orders', icon: ShoppingBag },
  { name: 'Students', href: '/manager/students', icon: Users },
  { name: 'Analytics', href: '/manager/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/manager/reports', icon: FileText },
];

interface ManagerSidebarProps {
  userName: string;
  universityName: string;
}

export function ManagerSidebar({ userName, universityName }: ManagerSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-2xl bg-white border-2 border-gray-200 shadow-sm"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r-2 border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manager Panel</h2>
                <p className="text-sm text-gray-600">{universityName}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {managerNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-600">Manager</p>
              </div>
            </div>
            <LogoutButton className="w-full" />
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation (only visible on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          {managerNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all',
                  isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
