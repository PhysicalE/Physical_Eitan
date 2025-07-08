
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from "@/lib/User";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, LogIn } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log("LoginForm: Attempting signin for", email);

    try {
      const response = await fetch(`${BASE_URL}/api/users/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      console.log("LoginForm: Signin API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred during signin' }));
        throw new Error(errorData.message || `התחברות נכשלה (סטטוס: ${response.status})`);
      }

      const data = await response.json(); 

      if (!data.token || !data.user) {
        throw new Error('תגובת שרת לא תקינה (חסר טוקן או אובייקט משתמש)');
      }
      console.log("LoginForm: Signin successful. Token received. User data:", data.user.email, data.user.role);

      User.updateMyUserData({ user: data.user, token: data.token }); 
      
      console.log("LoginForm: Navigating to Home with freshlyLoggedInUser:", User.current);
      navigate(createPageUrl('Home'), {
        state: {
          freshlyLoggedInUser: User.current, // User.current is now populated by updateMyUserData
          fromLogin: true,
        },
      });

    } catch (err) {
      console.error('LoginForm: Login error:', err);
      setError(err.message || 'שגיאת התחברות. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">התחברות</CardTitle>
        <CardDescription>
          הזן את פרטי ההתחברות שלך להמשך
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-between items-center text-sm">
            <Link 
              to={createPageUrl('RecoverPassword')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              שכחת סיסמה?
            </Link>
            <Link 
              to={createPageUrl('register')}
              className="text-indigo-600 hover:text-indigo-800"
            >
              צור חשבון חדש
            </Link>
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
                מתחבר...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" /> התחבר
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
