import React from 'react';
import ChangeEmailForm from '../components/forms/ChangeEmailForm';

export default function ChangeEmail() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">שינוי אימייל</h1>
      <div className="max-w-md mx-auto">
        <ChangeEmailForm />
      </div>
    </div>
  );
}