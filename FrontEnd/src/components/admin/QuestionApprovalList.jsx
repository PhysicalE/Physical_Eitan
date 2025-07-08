import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Tag,
  Calendar,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import QuestionCard from '../questions/QuestionCard';

const BASE_URL = import.meta.env.VITE_API_URL;

export default function QuestionApprovalList({ user }) {
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [processingQuestionIds, setProcessingQuestionIds] = useState([]);

  

  const fetchPendingTeacherRequests = async (token) => {
    if (!token) {
      setFetchError('חסר טוקן הזדהות');
      setIsLoadingQuestions(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/questions/unapproved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('אין לך הרשאות לצפייה בשאלות ממתינות');
        }
        const errorData = await response.json().catch(() => ({ message: 'שגיאה בטעינת שאלות ממתינות' }));
        throw new Error(errorData.message || 'שגיאה בטעינת שאלות ממתינות');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('תגובת שרת לא תקינה');
      }

      setQuestions(data);
      console.log("QuestionApprovalList: Fetched questions:", data);
      setFetchError('');

    } catch (error) {
      console.error('Error fetching pending questions:', error);
      setFetchError(error.message || 'אירעה שגיאה בטעינת השאלות');
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (user?.token && (user.role === 'admin' || user.role === 'teacher')) {
      fetchPendingTeacherRequests(user.token);
    } else {
      setIsLoadingQuestions(false);
      setFetchError('אין הרשאות מתאימות לצפייה בשאלות ממתינות');
    }
  }, [user]);

  const handleApprove = async (_id, questionId) => {
    if (!user || !user.token || !user._id || !(user.role === 'admin' || user.role === 'teacher')) {
      toast({ description: "אין לך הרשאות לבצע פעולה זו.", variant: "destructive" });
      return;
    }

    setProcessingQuestionIds(prev => [...prev, questionId]);

    try {
      const response = await fetch(`${BASE_URL}/api/questions/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ questionId, adminId: user._id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'שגיאה באישור השאלה' }));
        throw new Error(errorData.message || 'שגיאה באישור השאלה');
      }

    setQuestions(prev => prev.filter(q => q._id !== _id));
      toast({ description: "השאלה אושרה בהצלחה!" });
    } catch (error) {
      console.error('Error approving question:', error);
      toast({ description: error.message || "אירעה שגיאה באישור השאלה.", variant: "destructive" });
    } finally {
      setProcessingQuestionIds(prev => prev.filter(id => id !== questionId));
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את השאלה הזו?')) {
      return;
    }

    try {
      const token = user.token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      const result = await response.json();
      if (response.status === 200 && result.message === "Question deleted successfully") {
        toast({ description: "✅ השאלה נמחקה בהצלחה.", variant: "success" });
        setQuestions(prev => prev.filter(q => q._id !== questionId));
      }

    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ description: "❌ שגיאה במחיקת השאלה.", variant: "destructive" });
    }
  };

  const getQuestionContent = (question) => {
    if (question.content && typeof question.content === 'object') {
      return question.content.text;
    }
    return question.content;
  };

  if (!(user && (user.role === 'admin' || user.role === 'teacher'))) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {fetchError || 'נדרשות הרשאות מנהל לצפייה בתוכן זה.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (fetchError && !isLoadingQuestions) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">אישור שאלות</CardTitle>
          <CardDescription>כאן תוכל לאשר או למחוק שאלות חדשות</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingQuestions ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">אין שאלות ממתינות לאישור</h3>
              <p className="text-gray-500">כל השאלות במערכת אושרו</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-1">
                {questions.map((question) => (
                  <Card key={question._id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApprove(question._id, question.question_id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingQuestionIds.includes(question._id)}
                          >
                            {processingQuestionIds.includes(question._id) ? (
                              <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                מאשר...
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CheckCircle className="ml-2 h-4 w-4" />
                                אשר שאלה
                              </span>
                            )}
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleDelete(question._id)}
                          >
                            <Trash className="ml-2 h-4 w-4" />
                            מחק שאלה
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4"><QuestionCard question={question} /></div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags && question.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>נושא: {question.subject}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>נוצר: {format(new Date(question.createdAt), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
