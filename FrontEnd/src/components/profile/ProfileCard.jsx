import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function ProfileCard({ userData }) {
  if (!userData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg text-gray-400">טוען פרטי משתמש...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function getRoleInHebrew(role) {
    switch (role) {
      case 'admin':
        return 'מנהל';
      case 'teacher':
        return 'מורה';
      case 'student':
        return 'תלמיד';
      default:
        return role;
    }
  }

  function getRoleBadgeColor(role) {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2 text-center border-b">
        <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold">
            {userData.first_name && userData.last_name 
              ? `${userData.first_name[0]}${userData.last_name[0]}`
              : userData.email[0].toUpperCase()}
          </span>
        </div>
        <CardTitle className="text-2xl font-bold">
          {userData.first_name} {userData.last_name}
        </CardTitle>
        <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(userData.role)}`}>
          {getRoleInHebrew(userData.role)}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ul className="space-y-4">
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">כתובת אימייל</p>
              <p className="font-medium">{userData.email}</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">הרשאות</p>
              <p className="font-medium">{getRoleInHebrew(userData.role)}</p>
            </div>
          </li>
          <li className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">תאריך הרשמה</p>
              <p className="font-medium">
                {userData.created_date ? format(new Date(userData.created_date), 'dd/MM/yyyy') : 'לא ידוע'}
              </p>
            </div>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}