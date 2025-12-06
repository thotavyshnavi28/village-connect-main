import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { User, Building2, Shield, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  {
    id: 'citizen' as UserRole,
    title: 'Citizen',
    description: 'I want to report issues in my village',
    icon: User,
    color: 'primary',
  },
  {
    id: 'department' as UserRole,
    title: 'Department Official',
    description: 'I work in a village department',
    icon: Building2,
    color: 'secondary',
  },
  {
    id: 'admin' as UserRole,
    title: 'Admin',
    description: 'I manage the grievance system',
    icon: Shield,
    color: 'accent',
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedRole, setSelectedRole } = useAuth();
  const mode = searchParams.get('mode') || 'signup';

  const handleContinue = () => {
    if (selectedRole) {
      navigate(`/auth?mode=${mode}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Select Your Role</h1>
          <p className="text-sm text-muted-foreground">Choose how you'll use the system</p>
        </div>
      </div>

      {/* Role Cards */}
      <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {roles.map((role, index) => (
          <Card
            key={role.id}
            className={cn(
              "p-5 cursor-pointer transition-all duration-200 animate-slide-up",
              selectedRole === role.id 
                ? "ring-2 ring-primary shadow-glow border-primary" 
                : "hover:shadow-lg"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedRole(role.id)}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                role.id === 'citizen' && "bg-primary/10",
                role.id === 'department' && "bg-secondary/20",
                role.id === 'admin' && "bg-accent",
              )}>
                <role.icon className={cn(
                  "w-6 h-6",
                  role.id === 'citizen' && "text-primary",
                  role.id === 'department' && "text-secondary",
                  role.id === 'admin' && "text-accent-foreground",
                )} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{role.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
              </div>
              {selectedRole === role.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="mt-8 max-w-md mx-auto w-full">
        <Button 
          variant="hero" 
          size="xl" 
          className="w-full"
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
