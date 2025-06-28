
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  LayoutDashboard, 
  Mail, 
  TrendingUp, 
  FolderOpen, 
  Users, 
  Star, 
  BarChart3, 
  List, 
  Bell, 
  HelpCircle 
} from 'lucide-react';

interface ModernSidebarProps {
  userName?: string;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ userName = 'Markus' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  const getActiveItem = () => {
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.includes('/opportunities')) return 'opportunities';
    if (location.pathname.includes('/campaigns')) return 'campaigns';
    if (location.pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      onClick: () => navigate('/dashboard')
    },
    { 
      id: 'inbox', 
      label: 'Inboxs', 
      icon: Mail,
      onClick: () => navigate('/campaigns')
    },
    { 
      id: 'performances', 
      label: 'Performances', 
      icon: TrendingUp,
      onClick: () => navigate('/opportunities')
    },
    { 
      id: 'projects', 
      label: 'Projects', 
      icon: FolderOpen,
      hasSubmenu: true,
      submenuItems: [
        { label: 'Active Project', status: 'active' },
        { label: 'Project Done', status: 'done' },
        { label: 'Project On Hold', status: 'hold' }
      ],
      onClick: () => navigate('/campaigns')
    },
    { 
      id: 'employ-task', 
      label: 'Employ Task', 
      icon: Users,
      onClick: () => navigate('/settings')
    },
    { 
      id: 'absence', 
      label: 'Absence', 
      icon: Star,
      onClick: () => navigate('/settings')
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      onClick: () => navigate('/settings')
    },
    { 
      id: 'client-list', 
      label: 'Client List', 
      icon: List,
      onClick: () => navigate('/settings')
    },
    { 
      id: 'notification', 
      label: 'Notification', 
      icon: Bell,
      badge: 4,
      onClick: () => navigate('/settings')
    },
    { 
      id: 'help-center', 
      label: 'Help Center', 
      icon: HelpCircle,
      onClick: () => navigate('/settings')
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">6</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">InsightHub</h1>
        </div>
      </div>

      {/* User Greeting */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">M</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Hey, {userName}</p>
            <p className="text-xs text-gray-500">Sunday, June 25, 2024</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <div key={item.id}>
              <button
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.hasSubmenu && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
              
              {item.hasSubmenu && item.submenuItems && isActive && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.submenuItems.map((subItem, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        subItem.status === 'active' ? 'bg-blue-500' :
                        subItem.status === 'done' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <span className="text-gray-600">{subItem.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default ModernSidebar;
