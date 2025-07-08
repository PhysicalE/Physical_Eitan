import React from 'react';
// No longer needs its own User.me() or useEffect/useState for user data.
// It receives 'user' prop directly from Layout.jsx
import ProfileCard from '../components/profile/ProfileCard';
import ProfileMenu from '../components/profile/ProfileMenu';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile({ user }) { // Receives user prop from Layout
  if (!user) {
    // This state can occur if Layout is still loading or if user somehow isn't passed.
    // Layout's auth check should prevent rendering Profile page without a user.
    console.warn("Profile page rendered without a user prop.");
    return (
      <div className="container mx-auto max-w-5xl py-8">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-8 items-start">
          <div className="md:col-span-1">
             <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  console.log("Profile page rendering with user:", user.email, user.role);
  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">הפרופיל שלי</h1>
        <p className="text-gray-600 mt-2">צפייה ועריכת פרטי המשתמש שלך</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 mt-8 items-start">
        <div className="md:col-span-1">
          <ProfileCard userData={user} />
        </div>
        <div className="md:col-span-2">
          <ProfileMenu /> {/* ProfileMenu doesn't currently need user prop */}
        </div>
      </div>
    </div>
  );
}