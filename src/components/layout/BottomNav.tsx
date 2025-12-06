import { Home, Plus, User, LayoutDashboard, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const citizenNav = [
    { icon: Home, label: 'Community', path: '/community' },
    { icon: Plus, label: 'Submit', path: '/submit' },
    { icon: User, label: 'My Issues', path: '/my-grievances' },
  ];

  const departmentNav = [
    { icon: Home, label: 'Community', path: '/community' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  const adminNav = [
    { icon: Home, label: 'Community', path: '/community' },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
  ];

  const getNavItems = () => {
    switch (userData?.role) {
      case 'admin':
        return adminNav;
      case 'department':
        return departmentNav;
      default:
        return citizenNav;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-bottom md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
