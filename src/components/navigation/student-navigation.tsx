'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Bell, ChefHat, Clock, Heart, Search, ShoppingCart, User } from 'lucide-react';

import { LogoutButton } from '@/components/logout-button';

import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNavItems: NavItem[] = [
  { name: 'Menu', href: '/student', icon: ChefHat },
  { name: 'Cart', href: '/student/cart', icon: ShoppingCart },
  { name: 'Orders', href: '/student/orders', icon: Clock },
  { name: 'Profile', href: '/student/profile', icon: User },
];

const studentDesktopItems: NavItem[] = [
  { name: 'Browse Menu', href: '/student', icon: ChefHat },
  { name: 'Favorites', href: '/student/favorites', icon: Heart },
  { name: 'Order History', href: '/student/orders', icon: Clock },
  { name: 'Profile', href: '/student/profile', icon: User },
];

interface StudentNavigationProps {
  userName: string;
  universityName: string;
}

export function StudentNavigation({ userName, universityName }: StudentNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Top Navigation */}
      <div className="hidden lg:block">
        <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo and University */}
              <div className="flex items-center gap-4">
                <Image
                  src="https://aieraa.com/wp-content/uploads/2020/08/Aieraa-Overseas-Logo.png"
                  alt="Aieraa Hospitality"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Food Ordering</h1>
                  <p className="text-sm text-gray-600">{universityName}</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="flex items-center gap-1">
                {studentDesktopItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200',
                        isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Actions */}
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                  <Search className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 rounded-2xl hover:bg-gray-50 transition-colors relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <Link
                  href="/student/cart"
                  className="p-2 rounded-2xl hover:bg-gray-50 transition-colors relative"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </Link>
                <div className="h-6 w-px bg-gray-300 mx-2" />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-600">Student</p>
                  </div>
                  <LogoutButton variant="outline" />
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b-2 border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image
              src="https://aieraa.com/wp-content/uploads/2020/08/Aieraa-Overseas-Logo.png"
              alt="Aieraa Hospitality"
              width={80}
              height={32}
              className="h-6 w-auto"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">Food Ordering</p>
              <p className="text-xs text-gray-600">{universityName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-2xl hover:bg-gray-50">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-2xl hover:bg-gray-50 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {studentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all relative',
                  isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.name === 'Cart' && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    2
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        {/* Safe area for iOS devices */}
        <div className="h-safe-area-inset-bottom bg-white"></div>
      </div>
    </>
  );
}
