import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BookingProvider } from './contexts/BookingContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './components/auth/Login';
import BookingSuccess from './components/booking/BookingSuccess';
import './styles/theme.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <ToastProvider>
            <div className="App">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/booking/success" element={<BookingSuccess />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </div>
          </ToastProvider>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
