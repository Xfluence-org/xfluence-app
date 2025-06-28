
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

interface SidebarProps {
  activeItem?: string;
  userName?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard', userName = 'Name' }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'opportunities', label: 'Opportunities', icon: '💡', path: '/opportunities' },
    { id: 'campaigns', label: 'Campaigns', icon: '📱', path: '/campaigns' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    navigate(item.path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="w-70 bg-white border-r border-border flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <h1 className="text-h2 font-semibold text-text-primary">Xfluence</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            className={cn(
              "w-full text-left px-4 py-3 rounded-md transition-smooth flex items-center gap-3",
              activeItem === item.id
                ? "bg-background-tertiary text-primary font-semibold border-l-3 border-primary"
                : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-6 border-t border-border">
        <button 
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-text-secondary hover:bg-background-tertiary hover:text-text-primary rounded-md transition-smooth font-medium"
        >
          {userName} [log out →]
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
