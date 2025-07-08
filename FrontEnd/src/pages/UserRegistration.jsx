import React from 'react';
import UserRegistrationForm from '../components/forms/UserRegistrationForm';

export default function UserRegistration() {
  return (
    <div className="flex flex-col items-center w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <img
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"
          alt="Physics Logo"
          className="mx-auto h-20 w-20 rounded-full shadow-md"
        />
        <h1 className="mt-4 text-3xl font-bold text-indigo-600">פיזיקל</h1>
        <p className="mt-2 text-gray-600">הרשמה למערכת</p>
      </div>
      
      <UserRegistrationForm />
    </div>
  );
}