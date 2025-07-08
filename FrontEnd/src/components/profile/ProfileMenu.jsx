import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserIcon, KeyRound, Mail, ArrowRight } from 'lucide-react';

export default function ProfileMenu() {
  const navigate = useNavigate();
  
  const menuItems = [
    {
      title: 'שינוי סיסמה',
      description: 'עדכן את סיסמת החשבון שלך',
      icon: KeyRound,
      path: 'ChangePassword',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'שינוי אימייל',
      description: 'עדכן את כתובת האימייל שלך',
      icon: Mail,
      path: 'ChangeEmail',
      color: 'bg-purple-100 text-purple-700'
    }
  ];
  
  const handleNavigate = (path) => {
    navigate(createPageUrl(path));
  };
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <UserIcon className="ml-2 h-5 w-5 text-gray-500" />
          פעולות חשבון
        </h3>
        
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="w-full justify-between h-auto py-3 px-4 hover:bg-gray-50"
              onClick={() => handleNavigate(item.path)}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mr-4`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}