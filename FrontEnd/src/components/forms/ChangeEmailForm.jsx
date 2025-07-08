import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from "../../lib/User";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Mail, Save } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createPageUrl } from '@/utils';

const BASE_URL = import.meta.env.VITE_API_URL;


export default function ChangeEmailForm() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    oldEmail: '',
    newEmail: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setUserData(user);
        setFormData(prev => ({ ...prev, oldEmail: user.email }));
      } catch (error) {
        console.error("Failed to fetch user data", error);
        setError('לא ניתן לאמת את המשתמש. אנא נסה להתחבר שוב.');
        // navigate(createPageUrl('Signin'));
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      setError('אנא הזן כתובת אימייל חדשה תקינה');
      return;
    }

    if (formData.oldEmail === formData.newEmail) {
      setError('האימייל החדש זהה לאימייל הישן');
      return;
    }

    if (!userData || !userData.token) {
      setError('שגיאת אימות משתמש. אנא התחבר ונסה שוב.');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/users/changeEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify({
          oldEmail: formData.oldEmail,
          newEmail: formData.newEmail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          description: "האימייל שונה בהצלחה! תצטרך להתחבר מחדש.",
        });
        
        // Update local user data and then log out
        await User.updateMyUserData({ email: formData.newEmail }); 
        localStorage.removeItem('token'); // Clear token from local storage
        
        // Clear sensitive fields from User SDK if possible (or rely on logout)
        await User.updateMyUserData({ 
            token: null, 
            // Potentially clear other fields if User SDK stores them and logout doesn't fully clear
        });

        setTimeout(() => {
          navigate(createPageUrl('Signin')); 
        }, 2000);

      } else {
        setError(data.message || 'שינוי האימייל נכשל. אנא נסה שנית.');
      }
    } catch (error) {
      console.error('Change email error:', error);
      setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="ml-2 h-6 w-6 text-indigo-600" />
          שינוי כתובת אימייל
        </CardTitle>
        <CardDescription>עדכן את כתובת האימייל המשויכת לחשבונך.</CardDescription>
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
            <AlertDescription>האימייל שונה בהצלחה! כעת תועבר לדף ההתחברות.</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldEmail">אימייל ישן</Label>
            <Input
              id="oldEmail"
              name="oldEmail"
              type="email"
              value={formData.oldEmail}
              readOnly
              className="bg-gray-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newEmail">אימייל חדש</Label>
            <Input
              id="newEmail"
              name="newEmail"
              type="email"
              value={formData.newEmail}
              onChange={handleChange}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            disabled={isLoading || !userData}
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
                <Save className="mr-2 h-4 w-4" /> שמור אימייל חדש
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}