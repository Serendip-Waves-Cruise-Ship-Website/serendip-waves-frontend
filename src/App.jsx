import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { AuthContext, AuthProvider } from './AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import HomePage from './HomePage';
import DestinationsPage from './DestinationsPage';
import BookingModal from './BookingModal';
import SignupModal from './SignupModal';
import Navbar from './Navbar';
import LoginModal from './LoginModal';
import HeroBackground from './HeroBackground';
import CruiseShipsPage from './CruiseShipsPage';
import BookingOverviewPage from './BookingOverviewPage';
import SuperAdminDashboard from './SuperAdminDashboard';
import CustomerDashboard from './CustomerDashboard';
import FoodInventoryDashboard from './FoodInventoryDashboard';
import ItineraryDashboard from './ItineraryDashboard';
import CabinAdminDashboard from './CabinAdminDashboard';
import PassengerDashboard from './PassengerDashboard';
import AdminDashboard from './AdminDashboard';
import ChefDashboard from './ChefDashboard';
import DestinationDetails from './DestinationDetails';
import ManageCruises from './ManageCruises';
import ItineraryDetails from './ItineraryDetails';
import Enquiries from './Enquiries';
import MealsPreferencePage from './MealsPreferencePage';
import FacilitiesPreferencePage from './FacilitiesPreferencePage';
import MealsDashboard from './MealsDashboard';
import MealsOptionsDashboard from './MealsOptionsDashboard';
import FacilitiesDashboard from './FacilitiesDashboard';
import FacilityManagement from './FacilityManagement';
import ThingsToDo from './ThingstoDo';
import OurDining from './OurDining';
import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import DynamicPricing from './DynamicPricing';


function SignupRouteHandler({ isAuthenticated, setIsSignupModalOpen }) {
  React.useEffect(() => {
    setIsSignupModalOpen(true);
  }, [setIsSignupModalOpen]);
  
  if (isAuthenticated) return <Navigate to="/" />;
  
  return (
    <HeroBackground fullHeight={true}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        textAlign: 'center',
        color: 'white'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Join Serendip Waves
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
            Create Your Account for Luxury Cruising
          </p>
        </div>
      </div>
    </HeroBackground>
  );
}

function LoginRouteHandler({ isAuthenticated, setIsLoginModalOpen }) {
  React.useEffect(() => {
    setIsLoginModalOpen(true);
  }, [setIsLoginModalOpen]);
  
  if (isAuthenticated) return <Navigate to="/" />;
  
  return (
    <HeroBackground fullHeight={true}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        textAlign: 'center',
        color: 'white'
      }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Welcome to Serendip Waves
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>
            Where Luxury Meets the Sea
          </p>
        </div>
      </div>
    </HeroBackground>
  );
}

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, currentUser, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext); // Get from context
  const {
    setIsLoginModalOpen,
    setIsSignupModalOpen,
    isLoginModalOpen,
    isSignupModalOpen,
    defaultBookingCountry,
    loginKey
  } = props;
  const { isBookingModalOpen, setIsBookingModalOpen } = useContext(AuthContext);

  // Hide Navbar on customer dashboard and its subpages
  const hideNavbarRoutes = [
    '/customer-dashboard',
    '/super-admin',
    '/food-inventory-management',
    '/admin-dashboard',
    '/manage-cruises',
    '/booking-overview',
    '/passenger-management',
    '/itinerary-management',
    '/cabin-admin',
    '/enquiries', // Hide navbar for Enquiries page
    '/itinerary-details', // Hide navbar for Itinerary Details page
    '/dynamic-pricing', // Hide navbar for Dynamic Pricing page
    '/meals', // Hide navbar for Meal Preferences pages
    '/facilities', // Hide navbar for Facility Preferences pages
    '/meals-dashboard', // Hide navbar for Meals Dashboard
    '/meals-options-dashboard', // Hide navbar for Meals Options Dashboard
    '/facilities-dashboard', // Hide navbar for Facilities Dashboard
    '/chef-dashboard', // Hide navbar for Chef Dashboard
    '/facility-management' // Hide navbar for Facility Management page
  ];
  const shouldShowNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  const _sectionRef = useRef(null);

  const _handleScroll = () => {
    if (_sectionRef.current) {
      _sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {shouldShowNavbar && (
        <Navbar
          onSignupClick={() => setIsSignupModalOpen(true)}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />
      )}
      <LoginModal
        key={loginKey}
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          if (window.location.pathname === "/login") navigate("/");
        }}
        onSignupClick={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
          if (window.location.pathname === "/login") navigate("/signup");
        }}
      />
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => {
          setIsSignupModalOpen(false);
          if (window.location.pathname === "/signup") navigate("/");
        }}
        openLoginModal={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
          if (window.location.pathname === "/signup") navigate("/login");
        }}
      />
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        defaultCountry={defaultBookingCountry}
      />
      <Routes>
        <Route path="/" element={<HomePage onBookingClick={() => setIsBookingModalOpen(true)} />} />
        <Route path="/cruise-ships" element={<CruiseShipsPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/things-to-do" element={<ThingsToDo />} />
        <Route path="/our-dining" element={<OurDining />} />
        <Route path="/booking" element={<Navigate to="/" replace />} />
        <Route path="/booking-overview" element={<ProtectedRoute><BookingOverviewPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginRouteHandler isAuthenticated={isAuthenticated} setIsLoginModalOpen={setIsLoginModalOpen} />} />
        <Route path="/signup" element={<SignupRouteHandler isAuthenticated={isAuthenticated} setIsSignupModalOpen={setIsSignupModalOpen} />} />
        <Route path="/super-admin" element={<ProtectedRoute><SuperAdminDashboard /></ProtectedRoute>} />
        <Route path="/customer-dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/food-inventory-management" element={<ProtectedRoute><FoodInventoryDashboard /></ProtectedRoute>} />
        <Route path="/itinerary-management" element={<ProtectedRoute><ItineraryDashboard /></ProtectedRoute>} />
        <Route path="/manage-cruises" element={<ProtectedRoute><ManageCruises /></ProtectedRoute>} />
        <Route path="/cabin-admin" element={<ProtectedRoute><CabinAdminDashboard /></ProtectedRoute>} />
        <Route path="/passenger-management" element={<ProtectedRoute><PassengerDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/chef-dashboard" element={<ProtectedRoute><ChefDashboard /></ProtectedRoute>} />
        <Route path="/destination/:country" element={<DestinationDetails />} />
        <Route path="/itinerary-details" element={<ProtectedRoute><ItineraryDetails /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
        <Route path="/dynamic-pricing" element={<ProtectedRoute><DynamicPricing /></ProtectedRoute>} />
        <Route path="/meals/:bookingId" element={<ProtectedRoute><MealsPreferencePage /></ProtectedRoute>} />
        <Route path="/facilities/:bookingId" element={<ProtectedRoute><FacilitiesPreferencePage /></ProtectedRoute>} />
        <Route path="/meals-dashboard" element={<ProtectedRoute><MealsDashboard /></ProtectedRoute>} />
        <Route path="/meals-options-dashboard" element={<ProtectedRoute><MealsOptionsDashboard /></ProtectedRoute>} />
        <Route path="/meal-options-management" element={<ProtectedRoute><MealsOptionsDashboard /></ProtectedRoute>} />
        <Route path="/facilities-dashboard" element={<ProtectedRoute><FacilitiesDashboard /></ProtectedRoute>} />
        <Route path="/facility-management" element={<ProtectedRoute><FacilityManagement /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [defaultBookingCountry, _setDefaultBookingCountry] = useState("");
  const [loginKey, setLoginKey] = useState(Date.now());

  // Listen for logout events to force LoginModal remount
  useEffect(() => {
    const handleLogout = () => {
      setLoginKey(Date.now());
    };
    window.addEventListener('userLoggedOut', handleLogout);
    return () => window.removeEventListener('userLoggedOut', handleLogout);
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes
            setIsLoginModalOpen={setIsLoginModalOpen}
            setIsSignupModalOpen={setIsSignupModalOpen}
            isLoginModalOpen={isLoginModalOpen}
            isSignupModalOpen={isSignupModalOpen}
            defaultBookingCountry={defaultBookingCountry}
            loginKey={loginKey}
          />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
