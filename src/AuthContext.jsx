import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [defaultBookingCountry, setDefaultBookingCountry] = useState("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, check session with backend
  useEffect(() => {
    // First check localStorage for updated user data
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        console.log('Found user data in localStorage:', userData);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return; // Skip session check if we have valid localStorage data
      } catch (error) {
        console.log('Invalid localStorage data, checking session...');
        localStorage.removeItem('currentUser');
      }
    }

    // Fallback to session check if no localStorage data
    fetch('http://localhost/Project-I/backend/login.php?action=session_user', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        console.log('Session check response:', data);
        if (data.success && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          // Update localStorage with session data
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch((error) => {
        console.error('Session check error:', error);
        setCurrentUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const updateCurrentUser = (updatedUserData) => {
    console.log('Updating current user data:', updatedUserData);
    setCurrentUser(updatedUserData);
    // Update localStorage to persist the changes
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // Optionally, call backend to destroy session
    fetch('http://localhost/Project-I/backend/logout.php', { method: 'POST', credentials: 'include' });
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      currentUser, 
      setCurrentUser,
      updateCurrentUser, 
      login, 
      logout, 
      defaultBookingCountry, 
      setDefaultBookingCountry, 
      isBookingModalOpen, 
      setIsBookingModalOpen, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
