
import React, { useState, useEffect } from 'react';
import { User } from "../../lib/User";
import { Subject } from "@/lib/Subject";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MinusCircle, PlusCircle, AlertCircle, Save, ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const BASE_URL = import.meta.env.VITE_API_URL;



const STEP_TYPES = [
  { value: 'text', label: 'טקסט בלבד' },
  { value: 'image', label: 'תמונה בלבד' },
  { value: 'text+image', label: 'טקסט ותמונה' }
];

export default function AddQuestionForm() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [teacher, setTeacher] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [base64Image, setBase64Image] = useState(null);


  const [formData, setFormData] = useState({
    title: '',
    content: {
      text: '',
      image: ''
    },
    media_url: '',
    hints: ['', '', ''],
    solution: '',
    correct_answers: [
      { type: 'text', text: '', image: '', order: 1 }
    ],
    solution_steps: [
      { type: 'text', text: '', image: '', order: 1 }
    ],
    tags: [''],
    subject: '',
  });

  useEffect(() => {
    const fetchUserAndSubjects = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        const response = await fetch(`${BASE_URL}/api/subjects`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        });
        
        if (response.ok) {
          const subjectsData = await response.json();
          setSubjects(subjectsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    fetchUserAndSubjects();
  }, []);

  const handleContentChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  
const handleAnswerImageFileUpload = async (e, index) => {
  const file = e.target.files[0];
  if (!file || !user) return;

  const formDataUpload = new FormData();
  formDataUpload.append('image', file);
  formDataUpload.append('isApproved', user.role === 'teacher' || user.role === 'admin');

  try {
    const res = await fetch(`${BASE_URL}/api/questions/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` },
      body: formDataUpload
    });
    const data = await res.json();

    if (res.ok) {
      handleCorrectAnswerChange(index, 'image', data.url);
    } else {
      setError(data.message || 'שגיאה בהעלאת תמונה');
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError('שגיאה ברשת בהעלאת תמונה');
  }
};

const handleStepImageFileUpload = async (e, index) => {
  const file = e.target.files[0];
  if (!file || !user) return;

  const formDataUpload = new FormData();
  formDataUpload.append('image', file);
  formDataUpload.append('isApproved', user.role === 'teacher' || user.role === 'admin');

  try {
    const res = await fetch(`${BASE_URL}/api/questions/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${user.token}` },
      body: formDataUpload
    });
    const data = await res.json();

    if (res.ok) {
      handleSolutionStepChange(index, 'image', data.url);
    } else {
      setError(data.message || 'שגיאה בהעלאת תמונה');
    }
  } catch (err) {
    console.error('Upload error:', err);
    setError('שגיאה ברשת בהעלאת תמונה');
  }
};



const [imageFiles, setImageFiles] = useState({
  questionImage: null,
  answerImages: {}, // key: index
  stepImages: {}    // key: index
});

const handleLocalImageSelection = (e, field, index = null) => {
  const file = e.target.files[0];
  if (!file) return;

  setImageFiles(prev => {
    if (field === 'questionImage') {
      return { ...prev, questionImage: file };
    } else if (field === 'answerImage') {
      return {
        ...prev,
        answerImages: { ...prev.answerImages, [index]: file }
      };
    } else if (field === 'stepImage') {
      return {
        ...prev,
        stepImages: { ...prev.stepImages, [index]: file }
      };
    }
    return prev;
  });
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHintChange = (index, value) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData(prev => ({
      ...prev,
      hints: newHints
    }));
  };

  const addHint = () => {
    if (formData.hints.length < 3) {
      setFormData(prev => ({
        ...prev,
        hints: [...prev.hints, '']
      }));
    }
  };

  const removeHint = (index) => {
    if (formData.hints.length > 1) {
      const newHints = formData.hints.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        hints: newHints
      }));
    }
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData(prev => ({
      ...prev,
      tags: newTags
    }));
  };

  const addTag = () => {
    if (formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, '']
      }));
    }
  };

  const removeTag = (index) => {
    if (formData.tags.length > 1) {
      const newTags = formData.tags.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        tags: newTags
      }));
    }
  };

  // Handle correct answers
  const handleCorrectAnswerChange = (index, field, value) => {
    const newAnswers = [...formData.correct_answers];
    newAnswers[index] = {
      ...newAnswers[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      correct_answers: newAnswers
    }));
  };

  const addCorrectAnswer = () => {
    const newOrder = formData.correct_answers.length + 1;
    setFormData(prev => ({
      ...prev,
      correct_answers: [
        ...prev.correct_answers,
        { type: 'text', text: '', image: '', order: newOrder }
      ]
    }));
  };

  const removeCorrectAnswer = (index) => {
    if (formData.correct_answers.length > 1) {
      const newAnswers = formData.correct_answers.filter((_, i) => i !== index);
      // Fix ordering after removal
      const reorderedAnswers = newAnswers.map((answer, i) => ({
        ...answer,
        order: i + 1
      }));
      setFormData(prev => ({
        ...prev,
        correct_answers: reorderedAnswers
      }));
    }
  };

  // Handle solution steps
  const handleSolutionStepChange = (index, field, value) => {
    const newSteps = [...formData.solution_steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      solution_steps: newSteps
    }));
  };

  const addSolutionStep = () => {
    const newOrder = formData.solution_steps.length + 1;
    setFormData(prev => ({
      ...prev,
      solution_steps: [
        ...prev.solution_steps,
        { type: 'text', text: '', image: '', order: newOrder }
      ]
    }));
  };

  const removeSolutionStep = (index) => {
    if (formData.solution_steps.length > 1) {
      const newSteps = formData.solution_steps.filter((_, i) => i !== index);
      // Fix ordering after removal
      const reorderedSteps = newSteps.map((step, i) => ({
        ...step,
        order: i + 1
      }));
      setFormData(prev => ({
        ...prev,
        solution_steps: reorderedSteps
      }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("🔐 Token before validation:", user.token);
  if (!formData.title || !formData.content.text || !formData.solution || !formData.subject) {
    setError('אנא מלא את כל השדות הנדרשים');
    return;
  }

  if(user.role === 'teacher' ) {
    setTeacher(user._id);
  }
  const filteredHints = formData.hints.filter(hint => hint.trim() !== '');
  if (filteredHints.length > 3) {
    setError('ניתן להוסיף עד 3 רמזים בלבד');
    return;
  }

  const filteredTags = formData.tags.filter(tag => tag.trim() !== '');
  if (filteredTags.length > 5) {
    setError('ניתן להוסיף עד 5 תגיות בלבד');
    return;
  }

  const validCorrectAnswers = formData.correct_answers.filter(answer => {
    if (answer.type === 'text') return answer.text.trim() !== '';
    if (answer.type === 'image') return answer.image.trim() !== '';
    if (answer.type === 'text+image') return answer.text.trim() !== '' || answer.image.trim() !== '';
    return false;
  });

  if (validCorrectAnswers.length === 0) {
    setError('יש להוסיף לפחות תשובה נכונה אחת');
    return;
  }

  const validSolutionSteps = formData.solution_steps.filter(step => {
    if (step.type === 'text') return step.text.trim() !== '';
    if (step.type === 'image') return step.image.trim() !== '';
    if (step.type === 'text+image') return step.text.trim() !== '' || step.image.trim() !== '';
    return false;
  });

  setIsLoading(true);
  setError('');
const uploadImage = async (file, type) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type); // ✅ add this line
  formData.append('isApproved', user.role === 'teacher' || user.role === 'admin');

  const res = await fetch(`${BASE_URL}/api/questions/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${user.token}` },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.url;
};


try {
  // Upload question image if selected
if (imageFiles.questionImage) {
  const url = await uploadImage(imageFiles.questionImage, 'question');
  formData.content.image = url;
}

for (const [index, file] of Object.entries(imageFiles.answerImages)) {
  const url = await uploadImage(file, 'solution'); // ✅ or 'solution' depending on your backend logic
  formData.correct_answers[+index].image = url;
}

for (const [index, file] of Object.entries(imageFiles.stepImages)) {
  const url = await uploadImage(file, 'detailed');
  formData.solution_steps[+index].image = url;
}


  // ...now submit questionData
} catch (uploadErr) {
  setError("שגיאה בהעלאת תמונה: " + uploadErr.message);
  setIsLoading(false);
  return;
}

  try {
    console.log("🔐 Token before sending request:", user.token);

    const questionData = {
      ...formData,
      hints: filteredHints,
      tags: filteredTags,
      correct_answers: validCorrectAnswers,
      solution_steps: validSolutionSteps,
      subject: formData.subject,
      subject_id: formData.subject_id,

      teacher_id: teacher,
      approved_by: user.role === 'teacher' ? user._id : null,
      status: user.role === 'teacher' ? true : false, //מורה מאשר את השאלה

    };

    const response = await fetch(`${BASE_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      },
      body: JSON.stringify(questionData)
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(true);
      if (user.role === 'student') {
        alert("השאלה נשלחה ותוצג לאחר אישור מורה או מנהל.");
      }
      setTimeout(() => {
        navigate(createPageUrl('Subjects'));
      }, 2000);
    } else {
      setError(data.message || 'שגיאה בהוספת השאלה');
    }

  } catch (error) {
    console.error('Error submitting question:', error);
    setError('שגיאת שרת. אנא נסה שוב מאוחר יותר.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={() => navigate(createPageUrl('Subjects'))}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">הוספת שאלה חדשה</h1>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <AlertDescription>השאלה נוספה בהצלחה! מעביר אותך לדף הנושאים...</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="basic">
              פרטים בסיסיים
            </TabsTrigger>
            <TabsTrigger value="answers">
              תשובות נכונות
            </TabsTrigger>
            <TabsTrigger value="solution">
              פתרון מפורט
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>פרטי השאלה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">כותרת השאלה *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="הכנס כותרת לשאלה"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="content_text">תוכן השאלה *</Label>
                  <Textarea
                    id="content_text"
                    value={formData.content.text}
                    onChange={(e) => handleContentChange('text', e.target.value)}
                    placeholder="הכנס את תוכן השאלה"
                    className="mt-1 h-24"
                    required
                    dir="rtl"
                    lang="he"
                  />
                </div>
                
<div>
  <Label htmlFor="content_image">תמונה לשאלה</Label>
  <Input
    id="content_image"
    value={formData.content.image}
    onChange={(e) => handleContentChange('image', e.target.value)}
    placeholder="הכנס קישור לתמונה"
    className="mt-1 mb-2"
  />
<Label className="block mb-1">או העלה קובץ תמונה</Label>
<div className="flex flex-col gap-2">
  {imageFiles.questionImage && (
    <div className="relative w-fit">
      <img
        src={URL.createObjectURL(imageFiles.questionImage)}
        alt="תצוגה מקדימה"
        className="h-32 rounded border"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 bg-white shadow"
        onClick={() =>
          setImageFiles((prev) => ({ ...prev, questionImage: null }))
        }
      >
        <MinusCircle className="text-red-500 w-5 h-5" />
      </Button>
    </div>
  )}
  <input
    type="file"
    id="image_file"
    accept="image/*"
    onChange={(e) => handleLocalImageSelection(e, 'questionImage')}
    className="hidden"
  />
  <label
    htmlFor="image_file"
    className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
  >
    העלה קובץ
  </label>
</div>


</div>

                
                <div>
                  <Label htmlFor="subject">נושא *</Label>
                  <Select
                    onValueChange={(subjectId) => {
                      const selectedSubject = subjects.find(subj => subj._id === subjectId);
                      setFormData(prev => ({
                        ...prev,
                        subject: selectedSubject ? selectedSubject.name : '',
                        subject_id: subjectId
                      }));
                    }}

                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר נושא" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject._id} value={subject._id}>
                          {subject.name}
                        </SelectItem>

                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="media_url">קישור לסרטון הסבר</Label>
                  <Input
                    id="media_url"
                    name="media_url"
                    value={formData.media_url}
                    onChange={handleInputChange}
                    placeholder="הכנס קישור לסרטון (אופציונלי)"
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>רמזים (עד 3)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addHint}
                      disabled={formData.hints.length >= 3}
                    >
                      <PlusCircle className="h-4 w-4 ml-1" />
                      הוסף רמז
                    </Button>
                  </div>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={hint}
                        onChange={(e) => handleHintChange(index, e.target.value)}
                        placeholder={`רמז ${index + 1}`}
                        dir="rtl"
                        lang="he"
                        className="flex-1"

                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeHint(index)}
                        disabled={formData.hints.length <= 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>תגיות (עד 5)</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addTag}
                      disabled={formData.tags.length >= 5}
                    >
                      <PlusCircle className="h-4 w-4 ml-1" />
                      הוסף תגית
                    </Button>
                  </div>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder={`תגית ${index + 1}`}
                        dir="rtl"
                        lang="he"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeTag(index)}
                        disabled={formData.tags.length <= 1}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('answers')}
                  >
                    הבא: תשובות נכונות
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle>תשובות נכונות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>תשובות נכונות</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addCorrectAnswer}
                    >
                      <PlusCircle className="h-4 w-4 ml-1" />
                      הוסף תשובה
                    </Button>
                  </div>
                  
                  {formData.correct_answers.map((answer, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full text-white flex items-center justify-center font-bold text-sm">
                            {answer.order}
                          </div>
                          <h4 className="font-medium">תשובה {answer.order}</h4>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeCorrectAnswer(index)}
                          disabled={formData.correct_answers.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>סוג תשובה</Label>
                        <Select
                          value={answer.type}
                          onValueChange={(value) => handleCorrectAnswerChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר סוג" />
                          </SelectTrigger>
                          <SelectContent>
                            {STEP_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(answer.type === 'text' || answer.type === 'text+image') && (
                        <div>
                          <Label>טקסט</Label>
                          <Input
                            value={answer.text || ''}
                            onChange={(e) => handleCorrectAnswerChange(index, 'text', e.target.value)}
                            placeholder="הכנס את התשובה הנכונה"
                            dir="rtl"
                            lang="he"
                          />
                        </div>
                      )}
                      
{(answer.type === 'image' || answer.type === 'text+image') && (
  <div>
    <Label>תמונה</Label>
    <div className="mb-2">
      {imageFiles.answerImages[index] ? (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFiles.answerImages[index])}
            alt={`Preview ${index}`}
            className="h-32 rounded border"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 bg-white shadow"
            onClick={() =>
              setImageFiles((prev) => {
                const updated = { ...prev.answerImages };
                delete updated[index];
                return { ...prev, answerImages: updated };
              })
            }
          >
            <MinusCircle className="text-red-500 w-5 h-5" />
          </Button>
        </div>
      ) : answer.image ? (
        <div className="relative w-fit">
          <img
            src={answer.image}
            alt={`תמונה ${index}`}
            className="h-32 rounded border"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 bg-white shadow"
            onClick={() => handleCorrectAnswerChange(index, 'image', '')}
          >
            <MinusCircle className="text-red-500 w-5 h-5" />
          </Button>
        </div>
      ) : null}
    </div>

    <Label>תמונה (URL)</Label>
    <Input
      value={answer.image || ''}
      onChange={(e) => handleCorrectAnswerChange(index, 'image', e.target.value)}
      placeholder="הכנס קישור לתמונה"
      className="mb-2"
    />

    <Label className="block mb-1">או העלה קובץ תמונה</Label>
    <div className="flex flex-col gap-2">
      <input
        type="file"
        id={`answer_image_file_${index}`}
        accept="image/*"
        onChange={(e) => {
          handleLocalImageSelection(e, 'answerImage', index);
          handleCorrectAnswerChange(index, 'image', ''); // נקה URL אם מועלה קובץ
        }}
        className="hidden"
      />
      <label
        htmlFor={`answer_image_file_${index}`}
        className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
      >
        העלה קובץ
      </label>
    </div>
  </div>
)}



                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('basic')}
                  >
                    חזרה: פרטים בסיסיים
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('solution')}
                  >
                    הבא: פתרון מפורט
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="solution">
            <Card>
              <CardHeader>
                <CardTitle>פתרון מפורט</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="solution">פתרון מלא *</Label>
                  <Textarea
                    id="solution"
                    name="solution"
                    value={formData.solution}
                    onChange={handleInputChange}
                    placeholder="הכנס את הפתרון המלא לשאלה"
                    className="mt-1 h-24"
                    required
                    dir="rtl"
                    lang="he"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>שלבי פתרון</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addSolutionStep}
                    >
                      <PlusCircle className="h-4 w-4 ml-1" />
                      הוסף שלב
                    </Button>
                  </div>
                  
                  {formData.solution_steps.map((step, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-600 rounded-full text-white flex items-center justify-center font-bold text-sm">
                            {step.order}
                          </div>
                          <h4 className="font-medium">שלב {step.order}</h4>
                        </div>
                        
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeSolutionStep(index)}
                          disabled={formData.solution_steps.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label>סוג שלב</Label>
                        <Select
                          value={step.type}
                          onValueChange={(value) => handleSolutionStepChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר סוג" />
                          </SelectTrigger>
                          <SelectContent>
                            {STEP_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(step.type === 'text' || step.type === 'text+image') && (
                        <div>
                          <Label>טקסט</Label>
                          <Textarea
                            value={step.text || ''}
                            onChange={(e) => handleSolutionStepChange(index, 'text', e.target.value)}
                            placeholder="הסבר לשלב זה"
                            dir="rtl"
                            lang="he"
                            className="h-24"

                          />
                        </div>
                      )}
                      
{(step.type === 'image' || step.type === 'text+image') && (
  <div>
    <Label>תמונה</Label>
    <div className="mb-2">
      {imageFiles.stepImages[index] ? (
        <div className="relative w-fit">
          <img
            src={URL.createObjectURL(imageFiles.stepImages[index])}
            alt={`שלב ${index}`}
            className="h-32 rounded border"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 bg-white shadow"
            onClick={() =>
              setImageFiles((prev) => {
                const updated = { ...prev.stepImages };
                delete updated[index];
                return { ...prev, stepImages: updated };
              })
            }
          >
            <MinusCircle className="text-red-500 w-5 h-5" />
          </Button>
        </div>
      ) : step.image ? (
        <div className="relative w-fit">
          <img
            src={step.image}
            alt={`שלב ${index}`}
            className="h-32 rounded border"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 bg-white shadow"
            onClick={() => handleSolutionStepChange(index, 'image', '')}
          >
            <MinusCircle className="text-red-500 w-5 h-5" />
          </Button>
        </div>
      ) : null}
    </div>

    <Label>תמונה (URL)</Label>
    <Input
      value={step.image || ''}
      onChange={(e) => handleSolutionStepChange(index, 'image', e.target.value)}
      placeholder="הכנס קישור לתמונה"
      className="mb-2"
    />

    <Label className="block mb-1">או העלה קובץ תמונה</Label>
    <div className="flex flex-col gap-2">
      <input
        type="file"
        id={`step_image_file_${index}`}
        accept="image/*"
        onChange={(e) => {
          handleLocalImageSelection(e, 'stepImage', index);
          handleSolutionStepChange(index, 'image', ''); // נקה URL אם מעלים קובץ
        }}
        className="hidden"
      />
      <label
        htmlFor={`step_image_file_${index}`}
        className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
      >
        העלה קובץ
      </label>
    </div>
  </div>
)}


                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('answers')}
                  >
                    חזרה: תשובות נכונות
                  </Button>
                  
                  <Button 
                    type="submit" 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        שולח...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Save className="ml-2 h-4 w-4" />
                        שמור שאלה
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
