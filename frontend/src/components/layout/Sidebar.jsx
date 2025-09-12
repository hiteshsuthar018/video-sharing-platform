import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  TrendingUp,
  Users,
  Library,
  History,
  Clock,
  ThumbsUp,
  Settings,
  Play,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const mainNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Trending', href: '/trending', icon: TrendingUp },
    { name: 'Subscriptions', href: '/subscriptions', icon: Users },
  ];

  const libraryNavigation = [
    { name: 'Library', href: '/library', icon: Library },
    { name: 'History', href: '/history', icon: History },
    { name: 'Watch Later', href: '/watch-later', icon: Clock },
    { name: 'Liked Videos', href: '/liked-videos', icon: ThumbsUp },
  ];

  const creatorNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Settings },
    { name: 'Upload Video', href: '/upload', icon: Play },
  ];

  const NavigationItem = ({ item, isActive }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.href}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-blue-100 text-blue-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`} />
        <span className={isCollapsed ? 'hidden' : ''}>{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Collapse button - Desktop only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 mx-auto mt-4 mb-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
            {/* Main Navigation */}
            <div>
              <div className={`mb-3 ${isCollapsed ? 'hidden' : ''}`}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Main
                </h3>
              </div>
              <ul className="space-y-1">
                {mainNavigation.map((item) => (
                  <li key={item.name}>
                    <NavigationItem item={item} isActive={isActive(item.href)} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Library Navigation - Only show if authenticated */}
            {isAuthenticated && (
              <div>
                <div className={`mb-3 ${isCollapsed ? 'hidden' : ''}`}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Library
                  </h3>
                </div>
                <ul className="space-y-1">
                  {libraryNavigation.map((item) => (
                    <li key={item.name}>
                      <NavigationItem item={item} isActive={isActive(item.href)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Creator Navigation - Only show if authenticated */}
            {isAuthenticated && (
              <div>
                <div className={`mb-3 ${isCollapsed ? 'hidden' : ''}`}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Creator
                  </h3>
                </div>
                <ul className="space-y-1">
                  {creatorNavigation.map((item) => (
                    <li key={item.name}>
                      <NavigationItem item={item} isActive={isActive(item.href)} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <div className={`text-xs text-gray-500 ${isCollapsed ? 'hidden' : ''}`}>
              <p>© 2024 VideoShare</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-20 left-4 z-40 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
};

export default Sidebar;