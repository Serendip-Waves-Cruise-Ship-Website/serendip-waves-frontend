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
    // First check localStorage for persistent login (Stay signed in)
    let localUser = localStorage.getItem('currentUser');
    let isFromSession = false;
    
    // If not in localStorage, check sessionStorage for session-only login
    if (!localUser) {
      localUser = sessionStorage.getItem('currentUser');
      isFromSession = true;
    }
    
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        
        // Validate that we have essential user data
        if (userData && userData.id && userData.email) {
          // Check if login is expired (for localStorage only, after 30 days)
          if (!isFromSession && userData.loginTimestamp) {
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
            const isExpired = Date.now() - userData.loginTimestamp > thirtyDaysInMs;
            
            if (isExpired) {
              console.log('Login session expired, clearing localStorage...');
              localStorage.removeItem('currentUser');
              setCurrentUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          }
          
          setCurrentUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return; // Skip session check if we have valid stored data
        } else {
          console.log('Invalid user data in storage, removing...');
          localStorage.removeItem('currentUser');
          sessionStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.log('Invalid storage data, checking session...');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
      }
    }

    // Fallback to session check if no stored data
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
          // Update sessionStorage with session data (don't use localStorage for session-only)
          sessionStorage.setItem('currentUser', JSON.stringify(data.user));
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
    setIsAuthenticated(true); // Ensure authentication state is maintained
    // Update localStorage to persist the changes
    localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
  };

  const logout = () => {
    console.log('Logout function called');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Call backend to destroy session
    fetch('http://localhost/Project-I/backend/logout.php', { 
      method: 'POST', 
      credentials: 'include' 
    }).catch(err => console.log('Logout backend call failed:', err));
    
    // Immediately trigger the custom event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Also trigger it after a small delay as backup
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }, 100);
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
