// components/auth/User.js - Custom user management module

const BASE_URL = import.meta.env.VITE_API_URL;

export const User = {
  token: null,
  current: null, 

  updateMyUserData(data) {
    if (data && data.user && data.token) { 
      this.token = data.token;
      this.current = { ...data.user, token: data.token }; 
      localStorage.setItem('token', data.token);
      console.log("Custom User.js: User data updated and token stored.", this.current);
    } else if (data && data.token && data.email) { 
      this.token = data.token;
      this.current = { ...data }; // Assumes data includes all necessary user fields + token
      localStorage.setItem('token', data.token);
      console.log("Custom User.js: User data (with token) updated and token stored.", this.current);
    } else {
      console.error("Custom User.js: updateMyUserData received invalid data format", data);
    }
  },

  me: async () => {
    const tokenFromStorage = localStorage.getItem('token');
    console.log("Custom User.js: me() called. Token from storage:", tokenFromStorage ? "found" : "not found");

    if (!tokenFromStorage) {
      User.current = null;
      User.token = null;
      throw new Error('No token found in localStorage');
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, { 
        headers: {
          'Authorization': `Bearer ${tokenFromStorage}`,
        },
      });
      console.log("Custom User.js: /api/users/me response status:", res.status);

      if (!res.ok) {
        localStorage.removeItem('token'); 
        User.current = null;
        User.token = null;
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized or Token expired');
        }
        throw new Error(`Failed to fetch user from /api/users/me, status: ${res.status}`);
      }
      
      const userFromServer = await res.json();
      if (!userFromServer || !userFromServer._id) {
        localStorage.removeItem('token');
        User.current = null;
        User.token = null;
        throw new Error('Invalid user data received from /api/users/me');
      }

      User.current = { ...userFromServer, token: tokenFromStorage }; 
      User.token = tokenFromStorage;
      console.log("Custom User.js: User fetched successfully via me()", User.current);
      return User.current;
    } catch (error) {
      localStorage.removeItem('token');
      User.current = null;
      User.token = null;
      console.error("Custom User.js: Error in me()", error);
      throw error; 
    }
  },

  logout: () => {
    console.log("Custom User.js: logout() called.");
    localStorage.removeItem('token');
    User.token = null;
    User.current = null;
    return Promise.resolve(); 
  }
};