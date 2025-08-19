import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full px-4 md:px-6 py-1.5 bg-transparent">
      <div className="w-full flex items-center justify-between">
        <div className="font-bold text-lg md:text-xl text-black">
          Easynet Pro
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
            Ingenious Gen
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black">
            Events
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-700 hover:text-black">
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
          <Button variant="outline" size="sm" className="rounded-full text-xs md:text-sm">
            Sign In
          </Button>
        </nav>

        {/* Mobile/Tablet Navigation */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Button variant="ghost" size="icon" className="text-gray-700 hover:text-black">
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
          <Button variant="outline" size="sm" className="rounded-full text-xs">
            Sign In
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-700 hover:text-black"
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
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black justify-start">
              Ingenious Gen
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-black justify-start">
              Events
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;