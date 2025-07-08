import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen } from 'lucide-react';

export default function SubjectSidebar({ subjects, activeSubject, setActiveSubject, isLoading, user }) {
  const [showModal, setShowModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      alert('אנא הזן שם נושא');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${BASE_URL}/api/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name: newSubjectName, tags: [] })
      });
      if (response.ok) {
        alert('✅ נושא נוסף בהצלחה');
        setShowModal(false);
        setNewSubjectName('');
        window.location.reload(); // רענון לרשימת הנושאים
      } else {
        const data = await response.json();
        alert(`❌ שגיאה: ${data.error || 'לא ניתן להוסיף נושא'}`);
      }
    } catch (error) {
      alert('❌ שגיאת רשת: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full md:w-64 h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-gradient-to-l from-indigo-50 to-white">
        <h2 className="text-lg font-medium flex items-center">
          <BookOpen className="ml-2 h-5 w-5 text-indigo-600" />
          נושאי לימוד
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="w-full h-10 bg-gray-100 animate-pulse rounded mb-2"></div>
            ))
          ) : subjects.length > 0 ? (
            subjects.map((subject) => (
              <button
                key={subject._id}
                className={`w-full text-left px-4 py-2 rounded mb-1 ${
                  activeSubject === subject._id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setActiveSubject(subject._id)}
              >
                {subject.name}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-center p-4">לא נמצאו נושאים</p>
          )}

          {(user && (user.role === 'admin' || user.role === 'teacher')) && (

            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ➕ הוסף נושא חדש
            </button>
          )}
        </div>
      </ScrollArea>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">הוסף נושא חדש</h3>
            <input
              type="text"
              placeholder="שם הנושא"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                ביטול
              </button>
              <button
                onClick={handleAddSubject}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isSubmitting ? 'מוסיף...' : 'הוסף'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
