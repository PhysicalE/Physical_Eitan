import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function RecoverPasswordForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('אנא הזן כתובת אימייל תקינה');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/users/recoverPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // Always show success message, regardless of whether the email exists
      // This is a security feature to prevent email enumeration
      setShowSuccess(true);
      
      // Clear the form
      setEmail('');
    } catch (error) {
      console.error('Password recovery error:', error);
      // Still show success to prevent enumeration
      setShowSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
            onClick={() => navigate(createPageUrl('Signin'))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold">שחזור סיסמה</CardTitle>
        </div>
        <CardDescription>
          הזן את כתובת האימייל שלך ואנו נשלח לך הוראות לאיפוס הסיסמה
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>
              אם כתובת האימייל קיימת במערכת, הוראות לאיפוס הסיסמה נשלחו אליה.
              אנא בדוק את תיבת הדואר הנכנס שלך.
            </AlertDescription>
          </Alert>
        )}
        
        {!showSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  שולח...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Mail className="mr-2 h-4 w-4" /> שלח הוראות איפוס
                </span>
              )}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          {showSuccess ? (
            <Button 
              variant="link" 
              className="p-0 h-auto text-indigo-600 hover:text-indigo-800"
              onClick={() => navigate(createPageUrl('Signin'))}
            >
              חזרה לדף ההתחברות
            </Button>
          ) : (
            <>
              זוכר את הסיסמה?{' '}
              <Link to={createPageUrl('Signin')} className="text-indigo-600 hover:text-indigo-800 font-medium">
                התחבר כאן
              </Link>
            </>
          )}
        </p>
      </CardFooter>
    </Card>
  );
}