
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from "@/lib/User";
import RtlProvider from '../components/ui/rtl-provider';
import Navbar from '../components/layout/Navbar';

const publicPages = ['Signin', 'Signup', 'RecoverPassword', 'UserRegistration'];

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); 

  useEffect(() => {
    console.log("Layout Effect: Start auth check. Page:", currentPageName, "Current User State:", currentUser);
    const checkAuth = async () => {
      setIsAuthChecking(true);
     if (!currentPageName) {
      console.warn("Layout: Missing currentPageName! Redirecting to Signin.");
      navigate(createPageUrl("Signin"), { replace: true });
      return;
    }

      if (publicPages.includes(currentPageName)) {
        console.log("Layout Effect: Public page, skipping full auth.");
        setIsAuthChecking(false);
        return;
      }
      
      const navState = location.state;
      if (navState?.fromLogin && navState?.freshlyLoggedInUser) {
        console.log("Layout Effect: Fresh login detected. User from nav state:", navState.freshlyLoggedInUser.email);
        setCurrentUser(navState.freshlyLoggedInUser); 
        navigate(location.pathname, { replace: true, state: {} }); 
        setIsAuthChecking(false);
        return;
      }
      
      try {
        console.log("Layout Effect: No fresh login state. Attempting User.me().");
        const userFromMe = await User.me(); 
        console.log("Layout Effect: User.me() successful.", userFromMe.email);
        setCurrentUser(userFromMe);
      } catch (error) {
        console.error('Layout Effect: Auth check failed (User.me()), redirecting.', error.message);
        setCurrentUser(null);
        if (!publicPages.includes(currentPageName)) {
          navigate(createPageUrl('Signin'));
        }
      } finally {
        setIsAuthChecking(false);
        console.log("Layout Effect: Auth check finished. isAuthChecking:", false);
      }
    };
    
    checkAuth();
  }, [navigate, currentPageName, location.pathname, location.state]);

  if (isAuthChecking && !publicPages.includes(currentPageName)) {
    return (
      <RtlProvider>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">טוען...</p>
          </div>
        </div>
      </RtlProvider>
    );
  }
  
  if (publicPages.includes(currentPageName)) {
    return (
      <RtlProvider>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          {children}
        </div>
         <style>{`
          html { font-family: 'Assistant', 'Segoe UI', sans-serif; }
          .rtl { direction: rtl; text-align: right; }
        `}</style>
      </RtlProvider>
    );
  }
  
  if (!currentUser && !isAuthChecking && !publicPages.includes(currentPageName)) {
    console.warn("Layout: No currentUser, not auth checking, not public page. Should have been redirected by useEffect.");
    return null; 
  }

  let contentToRender = children;
  // הוספת הבדיקה להעברת prop רק לדפים ספציפיים
  const pagesThatNeedUserProp = ['Profile', 'QuestionsApproval'];
  if (
    currentUser &&
    React.isValidElement(children) &&
    pagesThatNeedUserProp.includes(currentPageName)
  ) {
    try {
      contentToRender = React.cloneElement(children, { user: currentUser });
      console.log(`Layout: Cloned children for ${currentPageName} with user prop.`);
    } catch (cloneError) {
      console.error(`Layout: Error cloning ${currentPageName} page with user prop:`, cloneError);
    }
  }


  return (
    <RtlProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {currentUser && <Navbar user={currentUser} />} 
        <main className="flex-1 p-4 md:p-6">
          {contentToRender}
        </main>
        <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
          מערכת פיזיקל &copy; {new Date().getFullYear()} - כל הזכויות שמורות
        </footer>
      </div>
      
      <style>{`
        html { font-family: 'Assistant', 'Segoe UI', sans-serif; }
        .rtl { direction: rtl; text-align: right; }
      `}</style>
    </RtlProvider>
  );
}
