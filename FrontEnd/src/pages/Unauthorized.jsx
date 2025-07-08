import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">אין הרשאה</h1>
        
        <p className="text-lg text-gray-600 mb-8">
          אין לך הרשאה לצפות בדף זה. פעולה זו דורשת הרשאות מנהל.
        </p>
        
        <Button
          onClick={() => navigate(createPageUrl('Home'))}
          className="flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          חזרה לדף הבית
        </Button>
      </div>
    </div>
  );
}