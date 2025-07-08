import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '../lib/User'; // Updated import path
import LoginForm from '../components/auth/LoginForm';

export default function Signin() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await User.me();
          navigate(createPageUrl('Home'));
        }
      } catch (error) {
        // Not logged in, stay on signin page
        localStorage.removeItem('token');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <img
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&h=150&q=80"
          alt="Physics Logo"
          className="mx-auto h-20 w-20 rounded-full shadow-md"
        />
        <h1 className="mt-4 text-3xl font-bold text-indigo-600">פיזיקל</h1>
        <p className="mt-2 text-gray-600">מערכת ללימוד ולהוראת פיזיקה</p>
      </div>
      
      <LoginForm />
    </div>
  );
}