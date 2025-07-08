import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from "@/lib/User";
import { Button } from '@/components/ui/button';
import { 
  BookOpenText, 
  PlusCircle, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Home
} from 'lucide-react';

export default function Navbar({ user }) { 
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Ensure user object is valid and has a role property before checking
  console.log('DEBUG user:', user);
  const isAdminOrTeacher  = user && user.role && (user.role === 'admin' || user.role === 'teacher');

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    try {
      await User.logout(); 
      console.log("Navbar: Client-side logout successful. User.current:", User.current);
      // Navigate to Signin page after logout
      navigate(createPageUrl('Signin'));
    } catch (error) {
      console.error("Navbar: Error during client-side logout:", error);
      // Still navigate to Signin even if logout had an issue on client (though User.logout is synchronous)
      navigate(createPageUrl('Signin')); 
    }
  };

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // If no user, don't render Navbar
  if (!user) { 
    return null; 
  }
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to={createPageUrl('Home')} className="flex items-center">
              <img
                className="h-10 w-auto"
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200&q=80"
                alt="Logo"
              />
              <span className="mr-2 text-xl font-bold text-indigo-600">פיזיקל</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4 md:space-x-reverse">
            <Link to={createPageUrl('Home')}>
              <Button 
                variant={location.pathname === createPageUrl('Home') ? "default" : "ghost"} 
                className="flex items-center"
              >
                <Home className="ml-2 h-5 w-5" />
                דף הבית
              </Button>
            </Link>
            <Link to={createPageUrl('Subjects')}>
              <Button 
                variant={location.pathname === createPageUrl('Subjects') ? "default" : "ghost"} 
                className="flex items-center"
              >
                <BookOpenText className="ml-2 h-5 w-5" />
                נושאים
              </Button>
            </Link>
            <Link to={createPageUrl('AddQuestion')}>
              <Button 
                variant={location.pathname === createPageUrl('AddQuestion') ? "default" : "ghost"} 
                className="flex items-center"
              >
                <PlusCircle className="ml-2 h-5 w-5" />
                הוסף שאלה
              </Button>
            </Link>
            
            {isAdminOrTeacher  && (
              <Link to={createPageUrl('QuestionsApproval')}>
                <Button 
                  variant={location.pathname === createPageUrl('QuestionsApproval') ? "default" : "ghost"}
                  className="flex items-center"
                >
                  <ShieldCheck className="ml-2 h-5 w-5" />
                  אישור שאלות
                </Button>
              </Link>
            )}
            {isAdminOrTeacher  && (
              <Link to={createPageUrl('AdminTeacherApproval')}>
                <Button 
                  variant={location.pathname === createPageUrl('AdminTeacherApproval') ? "default" : "ghost"}
                  className="flex items-center"
                >
                  <ShieldCheck className="ml-2 h-5 w-5" />
                  אישור מורים
                </Button>
              </Link>
            )}  


            <Link to={createPageUrl('Profile')}>
              <Button 
                variant={location.pathname === createPageUrl('Profile') ? "default" : "ghost"}
                className="flex items-center"
              >
                <UserIcon className="ml-2 h-5 w-5" />
                פרופיל ({user.first_name || user.email})
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="ml-2 h-5 w-5" />
              התנתק
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">פתח תפריט</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to={createPageUrl('Home')}
              onClick={() => setMobileMenuOpen(false)} // Close menu on click
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === createPageUrl('Home')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="ml-2 h-5 w-5" />
              דף הבית
            </Link>
            <Link 
              to={createPageUrl('Subjects')}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === createPageUrl('Subjects')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BookOpenText className="ml-2 h-5 w-5" />
              נושאים
            </Link>
            <Link 
              to={createPageUrl('AddQuestion')}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === createPageUrl('AddQuestion')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <PlusCircle className="ml-2 h-5 w-5" />
              הוסף שאלה
            </Link>
            
            {isAdminOrTeacher  && (
              <Link 
                to={createPageUrl('QuestionsApproval')}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === createPageUrl('QuestionsApproval')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                    <ShieldCheck className="ml-2 h-5 w-5" />
                אישור שאלות
              </Link>
            )}
            {isAdminOrTeacher  && (
              <Link 
                to={createPageUrl('AdminTeacherApproval')}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === createPageUrl('AdminTeacherApproval')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="ml-2 h-5 w-5" />
                אישור מורים
              </Link>
            )}

            <Link 
              to={createPageUrl('Profile')}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === createPageUrl('Profile')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserIcon className="ml-2 h-5 w-5" />
              פרופיל ({user.first_name || user.email})
            </Link>
            <button 
              onClick={handleLogout} // Logout will also close menu implicitly due to navigation
              className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="ml-2 h-5 w-5" />
              התנתק
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}