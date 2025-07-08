// src/lib/Subject.js

const BASE_URL = import.meta.env.VITE_API_URL;

export const Subject = {
  async getAll(token) {
    try {
      const res = await fetch(`${BASE_URL}/api/subjects`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch subjects. Status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Subject.getAll error:", error);
      return [];
    }
  },

  async create(subjectData, token) {
    try {
      const res = await fetch(`${BASE_URL}/api/subjects`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subjectData),
      });

      if (!res.ok) {
        throw new Error(`Failed to create subject. Status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error("Subject.create error:", error);
      return null;
    }
  },

  // תוכל להוסיף כאן פונקציות נוספות לפי צורך: getById, update, delete וכו'
};
