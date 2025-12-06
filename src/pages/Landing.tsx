import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Users, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    if (currentUser && userData) {
      navigate('/community');
    }
  }, [currentUser, userData, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-hero shadow-glow mb-8">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Village Grievance
            <span className="block text-primary">Management System</span>
          </h1>

          {/* Description */}
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Report issues, track resolutions, and build a better community together.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="flex flex-col items-center p-4 rounded-xl bg-card shadow-card">
              <Users className="w-6 h-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground text-center">Community Driven</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card shadow-card">
              <Building2 className="w-6 h-6 text-secondary mb-2" />
              <span className="text-xs text-muted-foreground text-center">Multi-Department</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-xl bg-card shadow-card">
              <Shield className="w-6 h-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground text-center">Transparent</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={() => navigate('/select-role?mode=signup')}
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/select-role?mode=login')}
            >
              Already have an account? Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        <p>Serving our village community with care</p>
      </footer>
    </div>
  );
}
