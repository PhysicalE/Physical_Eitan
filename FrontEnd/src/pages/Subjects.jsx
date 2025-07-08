import React, { useState, useEffect } from 'react';
import { Subject } from "@/lib/Subject";
import SubjectSidebar from '../components/subjects/SubjectSidebar';
import QuestionList from '../components/subjects/QuestionList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User } from '@/lib/User';

const BASE_URL = import.meta.env.VITE_API_URL;


export default function Subjects() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserAndSubjects = async () => {
      try {
        const userData = await User.me();
        console.log('User data:', userData.role);
        setUser(userData);
        
        const response = await fetch(`${BASE_URL}/api/subjects`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });
        
        if (response.ok) {
          const subjectsData = await response.json();
          setSubjects(subjectsData);
          
          // Set active subject to the first one by default
          if (subjectsData.length > 0 && !activeSubject) {
            setActiveSubject(subjectsData[0]._id);
          }
        } else {
          setError('שגיאה בטעינת הנושאים');
        }
      } catch (error) {
        console.error('Error loading subjects:', error);
        setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchUserAndSubjects();
  }, []);

  useEffect(() => {
    if (activeSubject) {
      fetchQuestions(activeSubject);
    }
  }, [activeSubject]);

  const fetchQuestions = async (subjectId) => {
    setIsLoadingQuestions(true);
    setQuestions([]);
    try {
      const response = await fetch(`${BASE_URL}/api/questions/by-subject/${subjectId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const questionsData = await response.json();
        setQuestions(questionsData);
      } else {
        setError('שגיאה בטעינת השאלות');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };


  // 🔴 פונקציה חדשה לחיפוש לפי תגית
  const fetchQuestionsByTag = async (tag) => {
    if (!tag.trim()) {
      // אם השדה ריק → מחזירים לשאלות של הנושא הנבחר
      fetchQuestions(activeSubject);
      return;
    }

    setIsLoadingQuestions(true);
    setQuestions([]);
    try {
      const response = await fetch(`${BASE_URL}/api/questions/by-tag/${tag}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        setError('שגיאה בחיפוש לפי תגית');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };


  const handleSubjectChange = (subjectId) => {
    setActiveSubject(subjectId);
  };

 return (
    <div className="container mx-auto h-[calc(100vh-9rem)]">
      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Subject Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 mb-4 md:mb-0">
          <SubjectSidebar
            user={user}
            subjects={subjects}
            activeSubject={activeSubject}
            setActiveSubject={handleSubjectChange}
            isLoading={isLoadingSubjects}
          />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-hidden">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">

            {/* 🔴 שורת חיפוש לפי תגיות */}
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש לפי תגית..."
                className="w-full p-2 border rounded"
              />
              <button
                onClick={() => fetchQuestionsByTag(searchQuery)}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                חפש
              </button>
            </div>

            <ScrollArea className="h-full pr-4 pb-8">
              {error ? (
                <div className="text-center p-12">
                  <p className="text-red-500">{error}</p>
                </div>
              ) : (
                <QuestionList
                  user={user}
                  questions={questions}
                  isLoading={isLoadingQuestions}
                />
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
