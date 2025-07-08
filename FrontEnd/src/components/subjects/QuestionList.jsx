import React from 'react';
import QuestionCard from '../questions/QuestionCard';
import { Skeleton } from '@/components/ui/skeleton';


export default function QuestionList({ user, questions, isLoading }) {
  if (isLoading) {
    return Array(3).fill(0).map((_, index) => (
      <div key={index} className="mb-6">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    ));
  }

  if (questions.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-600 mb-2">לא נמצאו שאלות בנושא זה</h3>
        <p className="text-gray-500">אנא בחר נושא אחר מהרשימה</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <QuestionCard key={question._id} question={question} user={user} />
        
      ))}
    </div>
  );
}