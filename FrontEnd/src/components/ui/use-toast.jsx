// This is a simple implementation for use-toast
import React from 'react';

export function toast({ description, variant = "default" }) {
  // Create a toast element
  const toastElement = document.createElement('div');
  toastElement.className = `fixed bottom-4 left-4 right-4 p-4 rounded-md text-center md:max-w-md md:mx-auto ${
    variant === 'destructive' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200'
  }`;
  toastElement.textContent = description;
  
  // Add to DOM
  document.body.appendChild(toastElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toastElement.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      document.body.removeChild(toastElement);
    }, 300);
  }, 3000);
}