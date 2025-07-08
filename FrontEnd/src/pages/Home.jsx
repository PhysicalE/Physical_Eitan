import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, BookOpen, Award, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">ברוכים הבאים למערכת פיזיקל</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          מערכת מתקדמת ללימוד והוראת פיזיקה, המכילה מאגר שאלות, סרטוני הסבר, ורמזים חכמים.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link to={createPageUrl('Subjects')} className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg group-hover:border-indigo-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">נושאי לימוד</h2>
              <p className="text-gray-600">גש למאגר הנושאים המקיף שלנו והתחל ללמוד עם שאלות ודוגמאות בכל תחום.</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to={createPageUrl('AddQuestion')} className="group">
          <Card className="h-full transition-all duration-300 hover:shadow-lg group-hover:border-indigo-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">הוסף שאלה</h2>
              <p className="text-gray-600">תרום למאגר השאלות שלנו על ידי הוספת שאלות חדשות ומאתגרות לקהילה.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="mb-12 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">על המערכת</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">מגוון נושאים</h3>
            <p className="text-gray-600">מערכת פיזיקל מכילה מגוון רחב של נושאי לימוד בפיזיקה, מחולקים לפי תחומים.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Lightbulb className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">רמזים חכמים</h3>
            <p className="text-gray-600">כל שאלה מלווה ברמזים שיעזרו לך להגיע לפתרון בעצמך, צעד אחר צעד, ללא צורך בהצצה ישירה בפתרון.</p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Award className="h-7 w-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">מידע חזותי</h3>
            <p className="text-gray-600">תמונות וסרטונים מלווים את השאלות כדי להמחיש את הנושאים הנלמדים בצורה ברורה ומובנת.</p>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">התחל ללמוד עכשיו</h2>
        <Button 
          size="lg" 
          className="bg-indigo-600 hover:bg-indigo-700 text-lg"
          onClick={() => window.location.href = createPageUrl('Subjects')}
        >
          <BookOpen className="ml-2 h-5 w-5" />
          לעמוד הנושאים
        </Button>
      </div>
    </div>
  );
}