import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "../../lib/User";import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, KeyRound, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.VITE_API_URL;


export default function ChangePasswordForm() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setUserData(user);
        setFormData(prev => ({ ...prev, email: user.email })); // Pre-fill email
      } catch (error) {
        console.error("Failed to fetch user data", error);
        setError('לא ניתן לאמת את המשתמש. אנא נסה להתחבר שוב.');
        // navigate(createPageUrl('Signin')); // Optional: redirect if not authenticated
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('הסיסמאות החדשות אינן תואמות');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      return;
    }
    
    if (!userData || !userData.token) {
      setError('שגיאת אימות משתמש. אנא התחבר ונסה שוב.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/users/changePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          email: formData.email,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          description: "הסיסמה שונתה בהצלחה! מומלץ להתחבר מחדש.",
        });
        setFormData({ // Clear form
            email: userData.email, // Keep email pre-filled
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: ''
        });
        // Optionally, logout or redirect
        // await User.logout();
        // navigate(createPageUrl('Signin'));
      } else {
        setError(data.message || 'שינוי הסיסמה נכשל. אנא בדוק את הסיסמה הישנה ונסה שנית.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <KeyRound className="ml-2 h-6 w-6 text-indigo-600" />
          שינוי סיסמה
        </CardTitle>
        <CardDescription>עדכן את סיסמת החשבון שלך.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-700">
            <AlertDescription>הסיסמה שונתה בהצלחה!</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              readOnly // Email should be read-only, fetched from user data
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oldPassword">סיסמה ישנה</Label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">סיסמה חדשה</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">אימות סיסמה חדשה</Label>
            <Input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type="password"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading || !userData} // Disable if userData hasn't loaded
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מעדכן...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Save className="mr-2 h-4 w-4" /> שמור סיסמה חדשה
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}