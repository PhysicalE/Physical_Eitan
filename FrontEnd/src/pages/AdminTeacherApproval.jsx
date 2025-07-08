import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '../lib/User';
import TeacherApprovalList from '../components/admin/TeacherApprovalList';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminTeacherApproval() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); 
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      setIsLoading(true);
      setPageError('');
      try {
        const userToAuth = await User.me();

        console.log("AdminTeacherApproval: User for auth check:", userToAuth?.email, userToAuth?.role);
        setCurrentUser(userToAuth);

        if (userToAuth && userToAuth.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          const message = userToAuth 
            ? 'אין לך הרשאות גישה לדף זה. הנך מועבר לדף הבית.' 
            : 'נדרשת התחברות לצפייה בדף זה. הנך מועבר להתחברות.';
          const redirectTo = userToAuth ? createPageUrl('Home') : createPageUrl('Signin');
          setPageError(message);
          setTimeout(() => navigate(redirectTo), 3000);
        }
      } catch (error) {
        console.error('AdminTeacherApproval: Auth check failed:', error.message);
        setCurrentUser(null);
        setIsAuthorized(false);
        setPageError('אימות נכשל או שנדרשת התחברות. הנך מועבר לדף ההתחברות.');
        setTimeout(() => navigate(createPageUrl('Signin')), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchUser();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">טוען הרשאות...</p>
        </div>
      </div>
    );
  }

  if (pageError && !isAuthorized) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAuthorized || !currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">אישור משתמשים כמורים</h1>
      <TeacherApprovalList adminUser={currentUser} />
    </div>
  );
}
