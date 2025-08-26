import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/EnproAuthContext";
import UserMenu from "@/components/UserMenu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <header className="w-full px-4 sm:px-4 md:px-4 lg:px-4 pt-2.5 pb-1.5 bg-transparent">
      <div className="w-full flex items-center justify-between">
        <img 
          src="/lovable-uploads/08de0c6d-a943-40ea-953a-e040d185cb65.png" 
          alt="Logo" 
          className="h-8 md:h-10 w-auto cursor-pointer"
          onClick={() => navigate('/')}
        />
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Button variant="ghost" size="sm" className="text-white hover:text-white/80">
            Ingenious Gen
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:text-white/80">
            Events
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-white/80"
            onClick={() => window.location.href = 'https://easynetpro.com/pricing'}
          >
            Pricing
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="19" cy="12" r="2" fill="currentColor"/>
              <circle cx="5" cy="5" r="2" fill="currentColor"/>
              <circle cx="12" cy="5" r="2" fill="currentColor"/>
              <circle cx="19" cy="5" r="2" fill="currentColor"/>
              <circle cx="5" cy="19" r="2" fill="currentColor"/>
              <circle cx="12" cy="19" r="2" fill="currentColor"/>
              <circle cx="19" cy="19" r="2" fill="currentColor"/>
            </svg>
          </Button>
          {user ? (
            <UserMenu />
          ) : (
            <Button 
              onClick={() => window.location.href = 'https://auth.easynetpro.com/api/auth/google?redirect_uri=' + encodeURIComponent(window.location.href)} 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs md:text-sm"
            >
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile/Tablet Navigation */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Button variant="ghost" size="icon" className="text-white hover:text-white/80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="19" cy="12" r="2" fill="currentColor"/>
              <circle cx="5" cy="5" r="2" fill="currentColor"/>
              <circle cx="12" cy="5" r="2" fill="currentColor"/>
              <circle cx="19" cy="5" r="2" fill="currentColor"/>
              <circle cx="5" cy="19" r="2" fill="currentColor"/>
              <circle cx="12" cy="19" r="2" fill="currentColor"/>
              <circle cx="19" cy="19" r="2" fill="currentColor"/>
            </svg>
          </Button>
          {user ? (
            <UserMenu />
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="sm" 
              className="rounded-full text-xs"
            >
              Sign In
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:text-white/80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2 pt-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-white/80 justify-start">
              Ingenious Gen
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-white/80 justify-start">
              Events
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-white/80 justify-start"
              onClick={() => window.location.href = 'https://easynetpro.com/pricing'}
            >
              Pricing
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;