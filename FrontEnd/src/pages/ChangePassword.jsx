import React from 'react';
import ChangePasswordForm from '../components/forms/ChangePasswordForm';

export default function ChangePassword() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">שינוי סיסמה</h1>
      <div className="max-w-md mx-auto">
        <ChangePasswordForm />
      </div>
    </div>
  );
}