import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Video, Image as ImageIcon, Lightbulb, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Trash } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL;


const isValidVideoUrl = (url) => {
  if (!url) return false;
  
  // Check for YouTube URLs
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  
  // Check for direct MP4 URLs
  const mp4Regex = /^https?:\/\/.*\.mp4$/;
  
  return youtubeRegex.test(url) || mp4Regex.test(url);
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  return url; // Return original URL if it's not a YouTube link
};

export default function QuestionCard({ question, user }) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageToView, setImageToView] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [shownHints, setShownHints] = useState(0);
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [isLoadingSolution, setIsLoadingSolution] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);




  const handleDelete = async (questionId) => {
    console.log('Deleting question with ID:', questionId);
    
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את השאלה הזו?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      const result = await response.json();

      if (response.status === 200 && result.message === "Question deleted successfully") {
        toast({
          description: "✅ השאלה נמחקה בהצלחה.",
          variant: "success",
        });
      }

      // שים לב: כרגע זה לא מעדכן את ה-UI, אז השאלה תיעלם רק אחרי רענון ידני
      // אם תרצה, אפשר להוסיף כאן setState שמסנן את השאלה מהרשימה

    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        description: "❌ שגיאה במחיקת השאלה.",
        variant: "destructive",
      });
    }
  };


  const handleVideoClick = () => {
    if (!question.media_url || !isValidVideoUrl(question.media_url)) {
      toast({
        description: "לא נמצא סרטון זמין.",
        variant: "destructive",
      });
      return;
    }
    setIsVideoOpen(true);
  };

  const handleImageClick = (imageUrl) => {
    if (!imageUrl) {
      toast({
        description: "לא נמצאה תמונה זמינה.",
        variant: "destructive",
      });
      return;
    }
    setImageToView(imageUrl);
    setIsImageOpen(true);
  };

  const showNextHint = () => {
    if (shownHints < question.hints.length) {
      setShownHints(prev => prev + 1);
    }
  };

  const fetchCorrectAnswers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${BASE_URL}/api/questions/${question._id}/solution`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch correct answers');

    const data = await response.json();
    console.log("📦 Fetched correct answers:", data);
    setCorrectAnswers(data.correct_answers || []);
    setShowCorrectAnswers(true);
    setShowSolution(false); // ודא שלא יוצג גם הפתרון
  } catch (error) {
    console.error('Error fetching correct answers:', error);
    toast({ description: "שגיאה בטעינת תשובה נכונה.", variant: "destructive" });
  }
};

const fetchSolution = async () => {
  if (!showSolution) {
    
    setIsLoadingSolution(true);
    try {
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${BASE_URL}/api/questions/${question._id}/solution`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch solution');
      }

      const data = await response.json();
        console.log("📦 Fetched solution data:", data);

      setSolutionSteps(data.solution_steps || []);
      setShowSolution(true);
      setShowCorrectAnswers(false); // כאשר נלחץ כפתור פתרון מלא – נסתיר תשובה קצרה
      setShowSolution(true);
    } catch (error) {
      console.error('Error fetching solution:', error);
      toast({
        description: "שגיאה בטעינת הפתרון.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSolution(false);
    }
  } else {
    setShowSolution(false);
  }
};


  // Handle content structure (new format with text & image)
  const questionContent = question.content && typeof question.content === 'object' 
    ? question.content 
    : { text: question.content, image: question.image };


    
  return (
    <Card className="mb-6 overflow-hidden hover:shadow-md transition-shadow duration-300">
      
      <CardHeader className="bg-gradient-to-l from-indigo-50 to-white">
        <CardTitle className="text-xl text-indigo-700">{question.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {/* Question Content */}
        <div className="mb-6">
          <p className="mb-4 text-gray-700 leading-relaxed">{questionContent.text}</p>
          
          {questionContent.image && (
            console.log('🔍 questionContent.image:', questionContent.image),
            <div className="mt-4">
              <img 
                src={String(questionContent.image || '')} 
                alt="תמונת השאלה"
                className="max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(questionContent.image)}
              />
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {question.media_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={handleVideoClick}
            >
              <Video className="ml-2 h-4 w-4" />
              צפה בסרטון
            </Button>
          )}
            {user && (user.role === 'admin' || user.role === 'teacher') && (
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center"
              onClick={() => handleDelete(question._id)}
            >
              <Trash className="ml-2 h-4 w-4" />
              מחק שאלה
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={() => {
              setShowHints(!showHints);
              if (!showHints) setShownHints(1);
            }}
          >
            <Lightbulb className="ml-2 h-4 w-4" />
            {showHints ? 'הסתר רמזים' : 'הצג רמזים'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={async () => {
              if (!correctAnswers.length) {
                await fetchCorrectAnswers();
              } else {
                setShowCorrectAnswers(!showCorrectAnswers);
                setShowSolution(false);
              }
            }}
          >
            <FileText className="ml-2 h-4 w-4" />
            {showCorrectAnswers ? 'הסתר תשובה נכונה' : 'הצג תשובה נכונה'}
          </Button>



          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex items-center",
              showSolution 
                ? "text-red-600 hover:text-red-700 hover:bg-red-50" 
                : "text-green-600 hover:text-green-700 hover:bg-green-50"
            )}
            onClick={fetchSolution}
            disabled={isLoadingSolution}
          >
            <FileText className="ml-2 h-4 w-4" />
            {isLoadingSolution ? 'טוען...' : (showSolution ? 'הסתר פתרון' : 'הצג פתרון')}
          </Button>
        </div>
        
        {/* Hints Section */}
          {showHints && question.hints?.length > 0 && shownHints > 0 && (
            <div className="mt-4 p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">רמזים:</h3>
              <ul className="list-disc list-inside space-y-2">
                {question.hints.slice(0, shownHints).map((hint, index) => (
                  <li key={index} className="text-amber-700">{hint}</li>
                ))}
              </ul>

            {shownHints < question.hints.length && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 text-amber-600 hover:text-amber-800"
                onClick={showNextHint}
              >
                הצג רמז נוסף ({shownHints + 1}/{question.hints.length})
              </Button>
            )}
          </div>
        )}
        
        {/* תשובה נכונה בלבד */}
{showCorrectAnswers && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <h4 className="font-medium text-blue-800 mb-4">תשובות נכונות:</h4>

    <div className="space-y-4">
      {correctAnswers
        .sort((a, b) => a.order - b.order)
        .map((answer, index) => (
          <div key={index} className="p-3 bg-blue-100 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {answer.order}
              </div>
              <span className="ml-2 text-blue-800 font-medium">
                {answer.type === 'text' && 'טקסט'}
                {answer.type === 'image' && 'תמונה'}
                {answer.type === 'text+image' && 'טקסט + תמונה'}
              </span>
            </div>

            {answer.text && (
              <p className="text-blue-700 mb-2">{answer.text}</p>
            )}

            {answer.image && (
              <img
                src={answer.image}
                alt={`תמונה לתשובה ${answer.order}`}
                className="max-h-40 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(answer.image)}
              />
            )}
          </div>
        ))}
    </div>
  </div>
)}

{/* פתרון + שלבי פתרון */}
{showSolution && (
  <div className="mt-4 p-4 bg-green-50 rounded-lg">
    <h3 className="font-medium text-green-800 mb-2">פתרון:</h3>
    <p className="text-green-700 mb-4">{question.solution}</p>

    {solutionSteps?.length > 0 && (
      <div className="mt-4">
        <Separator className="my-4" />
        <h4 className="font-medium text-green-800 mb-4">שלבי פתרון:</h4>

        <div className="space-y-4">
          {solutionSteps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <div key={index} className="p-3 bg-white bg-opacity-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    {step.order}
                  </div>
                </div>

                {step.text && <p className="text-green-700 mb-2">{step.text}</p>}

                {step.image && (
                  <div className="mt-2">
                    <img
                      src={step.image}
                      alt={`שלב ${step.order}`}
                      className="max-h-48 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(step.image)}
                    />
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    )}
  </div>

        )}
        
        {/* Video Dialog */}
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{question.title}</DialogTitle>
            </DialogHeader>
            <div className="relative pt-[56.25%]">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                src={getYouTubeEmbedUrl(question.media_url)}
                title={question.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Image Dialog */}
        <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{question.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={imageToView}
                alt={question.title}
                className="max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  toast({
                    description: "שגיאה בטעינת התמונה.",
                    variant: "destructive",
                  });
                  setIsImageOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}