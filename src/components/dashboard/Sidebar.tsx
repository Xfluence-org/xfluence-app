import React from 'react';
import { Home, Target, Users, BarChart, FileText } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  userName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ userName }) => {
  const location = useLocation();
  const { profile } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/brand-dashboard' },
    { name: 'Campaigns', icon: Target, path: '/brand-campaigns' },
    { name: 'Task Management', icon: FileText, path: '/task-management' },
    { name: 'Applications', icon: Users, path: '/brand-applications' },
    { name: 'Analytics', icon: BarChart, path: '/analytics' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 flex items-center justify-center border-b border-gray-200">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-[#1DDCD3] text-white">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-semibold text-lg text-gray-800">{userName}</h2>
          <p className="text-sm text-gray-500">{profile?.user_type}</p>
        </div>
      </div>

      <nav className="py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 space-x-3 rounded-md hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-gray-100 font-semibold text-[#1DDCD3]' : 'text-gray-700'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 mt-auto">
        <p className="text-xs text-gray-500">
          Version 0.1.0
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
