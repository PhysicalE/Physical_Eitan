import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";


const BASE_URL = import.meta.env.VITE_API_URL;


export default function TeacherApprovalList({ adminUser }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingTeacherRequests();
  }, []);

  const fetchPendingTeacherRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/api/users/admin/teacher-requests`, {
        headers: {
          Authorization: `Bearer ${adminUser.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
      } else {
        setError('שגיאה בטעינת בקשות המורים');
      }
    } catch (err) {
      console.error(err);
      setError('שגיאת שרת בעת טעינת הבקשות');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setError('');
    setActionMessage('');
    try {
      const response = await fetch(`${BASE_URL}/api/users/admin/approve-teacher/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminUser.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage(`המשתמש ${data.user.first_name} אושר כמורה`);
        setPendingUsers(prev => prev.filter(user => user._id !== userId));
      } else {
        setError(data.message || 'שגיאה באישור המשתמש');
      }
    } catch (err) {
      console.error(err);
      setError('שגיאת שרת בעת אישור המשתמש');
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">טוען בקשות...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {actionMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800 max-w-md mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{actionMessage}</AlertDescription>
        </Alert>
      )}

      {pendingUsers.length === 0 ? (
        <p className="text-center text-gray-600">אין בקשות ממתינות כרגע</p>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user._id} className="p-4 border rounded shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium">{user.first_name} {user.last_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(user._id)}
              >
                אשר כמורה
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
